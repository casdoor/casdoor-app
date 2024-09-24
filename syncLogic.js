// Copyright 2024 The Casdoor Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {eq} from "drizzle-orm";
import * as schema from "./db/schema";
import * as api from "./api";
import {generateToken} from "./totpUtil";
import useStore from "./useStorage";

function handleTokenExpiration() {
  const {clearAll} = useStore.getState();
  clearAll();
}

function getLocalAccounts(db) {
  return db.select().from(schema.accounts).all();
}

function getAccountKey(account) {
  return `${account.accountName}:${account.issuer ?? ""}`;
}

async function updateLocalDatabase(db, accounts) {
  return db.transaction(async(tx) => {
    // remove all accounts
    // await tx.delete(schema.accounts).run();

    for (const account of accounts) {
      if (account.id) {
        if (account.deletedAt === null || account.deletedAt === undefined) {
          // compare all fields
          const acc = await tx.select().from(schema.accounts).where(eq(schema.accounts.id, account.id)).get();
          if (acc.issuer === account.issuer &&
            acc.accountName === account.accountName &&
            acc.secretKey === account.secretKey &&
            acc.deletedAt === account.deletedAt
          ) {
            continue;
          }
          await tx.update(schema.accounts).set({
            issuer: account.issuer,
            accountName: account.accountName,
            secretKey: account.secretKey,
            deletedAt: null,
            token: generateToken(account.secretKey),
            changedAt: new Date(),
          }).where(eq(schema.accounts.id, account.id));
        } else {
          await tx.delete(schema.accounts).where(eq(schema.accounts.id, account.id));
        }
      } else {
        await tx.insert(schema.accounts).values({
          issuer: account.issuer || null,
          accountName: account.accountName,
          secretKey: account.secretKey,
          token: generateToken(account.secretKey),
        });
      }
    }
  });
}

function mergeAccounts(localAccounts, serverAccounts, serverTimestamp) {
  const isNewer = (a, b) => new Date(a) > new Date(b);

  const mergedAccounts = new Map();
  const localAccountKeys = new Map();

  // Process local accounts
  for (const local of localAccounts) {
    const key = getAccountKey(local);
    mergedAccounts.set(key, {
      ...local,
      synced: false,
    });

    // Store both current and old account keys for local accounts
    localAccountKeys.set(key, local);
    if (local.oldAccountName) {
      const oldKey = getAccountKey({...local, accountName: local.oldAccountName});
      localAccountKeys.set(oldKey, local);
    }
  }

  const processedLocalKeys = new Set();

  // Merge with server accounts
  for (const server of serverAccounts) {
    const serverKey = getAccountKey(server);
    const localAccount = localAccountKeys.get(serverKey);

    if (!localAccount) {
      // New account from server
      mergedAccounts.set(serverKey, {...server, synced: true});
    } else {
      const localKey = getAccountKey(localAccount);
      const local = mergedAccounts.get(localKey);

      if (isNewer(serverTimestamp, local.changedAt)) {
        // Server has newer changes
        mergedAccounts.set(localKey, {
          ...server,
          id: local.id,
          oldAccountName: local.accountName !== server.accountName ? local.accountName : local.oldAccountName,
          synced: true,
        });
      } else if (local.accountName !== server.accountName) {
        mergedAccounts.set(localKey, {
          ...local,
          oldAccountName: server.accountName,
          synced: false,
        });
      }
      // If local is newer or deleted, keep the local version (already in mergedAccounts)
      processedLocalKeys.add(localKey);
    }
  }

  // Handle server-side deletions
  for (const [key, local] of mergedAccounts) {
    if (!processedLocalKeys.has(key) && local.syncAt && isNewer(serverTimestamp, local.syncAt)) {
      // This account was not found on the server and was previously synced
      // Mark it as deleted
      mergedAccounts.set(key, {...local, deletedAt: new Date(), synced: true});
    }
  }

  return Array.from(mergedAccounts.values());
}

export async function syncWithCloud(db, userInfo, serverUrl, token) {
  try {
    const localAccounts = await getLocalAccounts(db);

    const {updatedTime, mfaAccounts: serverAccounts} = await api.getMfaAccounts(
      serverUrl,
      userInfo.owner,
      userInfo.name,
      token
    );

    const mergedAccounts = mergeAccounts(localAccounts, serverAccounts, updatedTime);

    await updateLocalDatabase(db, mergedAccounts);

    const accountsToSync = mergedAccounts.filter(account => account.deletedAt === null || account.deletedAt === undefined)
      .map(account => ({
        issuer: account.issuer,
        accountName: account.accountName,
        secretKey: account.secretKey,
      }));

    const serverAccountsStringified = serverAccounts.map(account => JSON.stringify({
      issuer: account.issuer,
      accountName: account.accountName,
      secretKey: account.secretKey,
    }));

    const accountsToSyncStringified = accountsToSync.map(account => JSON.stringify(account));

    if (JSON.stringify(accountsToSyncStringified.sort()) !== JSON.stringify(serverAccountsStringified.sort())) {
      const {status} = await api.updateMfaAccounts(
        serverUrl,
        userInfo.owner,
        userInfo.name,
        accountsToSync,
        token
      );

      if (status !== "ok") {
        throw new Error("Sync failed");
      }
    }

    await db.update(schema.accounts).set({syncAt: new Date()}).run();

  } catch (error) {
    if (error.message.includes("Access token has expired")) {
      handleTokenExpiration();
      throw new Error("Access token has expired, please login again.");
    }
    throw error;
  }
}
