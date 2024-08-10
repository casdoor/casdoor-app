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

import totp from "totp-generator";
import * as api from "./api";

export async function migrateDb(db) {
  const DATABASE_VERSION = 1;
  const result = await db.getFirstAsync("PRAGMA user_version");
  let currentVersion = result?.user_version ?? 0;
  if (currentVersion === DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
PRAGMA journal_mode = 'wal';
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    issuer TEXT,
    account_name TEXT NOT NULL,
    old_account_name TEXT DEFAULT NULL,
    secret TEXT NOT NULL,
    token TEXT,
    is_deleted INTEGER DEFAULT 0,
    last_change_time INTEGER DEFAULT (strftime('%s', 'now')),
    last_sync_time INTEGER DEFAULT NULL
);
`);
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    currentVersion = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

const generateToken = (secretKey) => {
  if (secretKey !== null && secretKey !== undefined && secretKey !== "") {
    try {
      const token = totp(secretKey);
      const tokenWithSpace = token.slice(0, 3) + " " + token.slice(3);
      return tokenWithSpace;
    } catch (error) {
      return "Secret Invalid";
    }
  } else {
    return "Secret Empty";
  }
};

export async function insertAccount(db, account) {
  const token = generateToken(account.secretKey);
  const currentTime = Math.floor(Date.now() / 1000);
  return await db.runAsync(
    "INSERT INTO accounts (issuer, account_name, secret, token, last_change_time) VALUES (?, ?, ?, ?, ?)",
    account.issuer ?? "",
    account.accountName,
    account.secretKey,
    token ?? "",
    currentTime
  );
}

export async function updateAccountName(db, id, newAccountName) {
  const account = await db.getFirstAsync("SELECT * FROM accounts WHERE id = ?", id);
  const currentTime = Math.floor(Date.now() / 1000);

  // Only update old_account_name if it's null or if last_sync_time is more recent than last_change_time
  if (account.old_account_name === null || (account.last_sync_time && account.last_sync_time > account.last_change_time)) {
    await db.runAsync(`
      UPDATE accounts 
      SET account_name = ?, 
          old_account_name = ?,
          last_change_time = ?
      WHERE id = ?
    `, newAccountName, account.account_name, currentTime, id);
  } else {
    await db.runAsync(`
      UPDATE accounts 
      SET account_name = ?, 
          last_change_time = ?
      WHERE id = ?
    `, newAccountName, currentTime, id);
  }
}

export async function updateAccount(db, account, id) {
  const token = generateToken(account.secretKey);
  const currentTime = Math.floor(Date.now() / 1000);
  const result = await db.runAsync(
    "UPDATE accounts SET issuer = ?, account_name = ?, old_account_name = ?, secret = ?, token = ?, last_change_time = ? WHERE id = ?",
    account.issuer,
    account.accountName,
    account.oldAccountName ?? null,
    account.secretKey,
    token ?? "",
    currentTime,
    id
  );

  if (result.changes === 0) {
    throw new Error(`No account updated for id: ${id}`);
  }
  return result;
}

export async function deleteAccount(db, id) {
  const currentTime = Math.floor(Date.now() / 1000);
  await db.runAsync("UPDATE accounts SET is_deleted = 1, last_change_time = ? WHERE id = ?", currentTime, id);
}

export async function trueDeleteAccount(db, id) {
  return await db.runAsync("DELETE FROM accounts WHERE id = ?", id);
}

export function updateToken(db, id) {
  const result = db.getFirstSync("SELECT secret FROM accounts WHERE id = ?", id);
  if (result.secret === null) {
    return;
  }
  const token = generateToken(result.secret);
  return db.runSync("UPDATE accounts SET token = ? WHERE id = ?", token, id);
}

export async function updateTokenForAll(db) {
  const accounts = await db.getAllAsync("SELECT * FROM accounts WHERE is_deleted = 0");
  for (const account of accounts) {
    const token = generateToken(account.secret);
    await db.runAsync("UPDATE accounts SET token = ? WHERE id = ?", token, account.id);
  }
}

export async function getAllAccounts(db) {
  const accounts = await db.getAllAsync("SELECT * FROM accounts WHERE is_deleted = 0");
  return accounts.map(account => {
    const mappedAccount = {
      ...account,
      accountName: account.account_name,
      secretKey: account.secret,
    };
    return mappedAccount;
  });
}

async function getLocalAccounts(db) {
  const accounts = await db.getAllAsync("SELECT * FROM accounts");
  return accounts.map(account => ({
    id: account.id,
    issuer: account.issuer,
    accountName: account.account_name,
    oldAccountName: account.old_account_name,
    secretKey: account.secret,
    isDeleted: account.is_deleted === 1,
    lastChangeTime: account.last_change_time,
    lastSyncTime: account.last_sync_time,
  }));
}

async function updateSyncTimeForAll(db) {
  const currentTime = Math.floor(Date.now() / 1000);
  await db.runAsync("UPDATE accounts SET last_sync_time = ?", currentTime);
}

export function calculateCountdown() {
  const now = Math.floor(Date.now() / 1000);
  return 30 - (now % 30);
}

async function updateLocalDatabase(db, mergedAccounts) {
  for (const account of mergedAccounts) {
    if (account.id) {
      if (account.isDeleted) {
        await db.runAsync("DELETE FROM accounts WHERE id = ?", account.id);
      } else {
        await updateAccount(db, account, account.id);
      }
    } else {
      await insertAccount(db, account);
    }
  }
}

function getAccountKey(account) {
  return `${account.issuer}:${account.accountName}`;
}

function mergeAccounts(localAccounts, serverAccounts, serverTimestamp) {
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

      if (serverTimestamp > local.lastChangeTime) {
        // Server has newer changes
        mergedAccounts.set(localKey, {
          ...server,
          id: local.id,
          oldAccountName: local.accountName !== server.accountName ? local.accountName : local.oldAccountName,
          synced: true,
        });
      } else if (local.accountName !== server.accountName) {
        // Local name change is newer, update the server account name
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
    if (!processedLocalKeys.has(key) && local.lastSyncTime && local.lastSyncTime < serverTimestamp) {
      // This account was not found on the server and was previously synced
      // Mark it as deleted
      mergedAccounts.set(key, {...local, isDeleted: true, synced: true});
    }
  }

  return Array.from(mergedAccounts.values());
}

export async function syncWithCloud(db, userInfo, serverUrl, token) {
  const localAccounts = await getLocalAccounts(db);
  const {updatedTime, mfaAccounts: serverAccounts} = await api.getMfaAccounts(
    serverUrl,
    userInfo.owner,
    userInfo.name,
    token
  );

  const serverTimestamp = Math.floor(new Date(updatedTime).getTime() / 1000);

  const mergedAccounts = mergeAccounts(localAccounts, serverAccounts, serverTimestamp);
  await updateLocalDatabase(db, mergedAccounts);

  const accountsToSync = mergedAccounts.filter(account => !account.isDeleted).map(account => ({
    issuer: account.issuer,
    accountName: account.accountName,
    secretKey: account.secretKey,
  }));

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

  await updateSyncTimeForAll(db);
  await updateTokenForAll(db);
}
