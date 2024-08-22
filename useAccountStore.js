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

import {db} from "./db/client";
import * as schema from "./db/schema";
import {eq} from "drizzle-orm";
import {create} from "zustand";
import {generateToken} from "./totpUtil";
import {syncWithCloud} from "./syncLogic";

const useEditAccountStore = create((set, get) => ({
  account: {id: undefined, issuer: undefined, accountName: undefined, secretKey: undefined, oldAccountName: undefined},
  setAccount: (account) => set({account}),
  updateAccount: () => {
    const {id, accountName, issuer, secretKey, oldAccountName} = get().account;
    if (!id) {return;}

    const updateData = {};
    if (accountName) {updateData.accountName = accountName;}
    if (issuer) {updateData.issuer = issuer;}
    if (secretKey) {updateData.secretKey = secretKey;}

    if (Object.keys(updateData).length > 0) {
      const currentAccount = db.select().from(schema.accounts)
        .where(eq(schema.accounts.id, Number(id))).limit(1)
        .get();
      if (currentAccount) {
        if (currentAccount.oldAccountName === null && oldAccountName) {
          updateData.oldAccountName = oldAccountName;
        }
        db.update(schema.accounts).set({...updateData, changedAt: new Date()}).where(eq(schema.accounts.id, id)).run();
      }
    }
    set({
      account: {
        id: undefined,
        issuer: undefined,
        accountName: undefined,
        oldAccountName: undefined,
        secretKey: undefined,
      },
    });
  },

  insertAccount: () => {
    const {accountName, issuer, secretKey} = get().account;
    if (!accountName || !secretKey) {return;}
    db.insert(schema.accounts)
      .values({accountName, issuer: issuer ? issuer : null, secretKey, token: generateToken(secretKey)})
      .run();
    set({account: {id: undefined, issuer: undefined, accountName: undefined, secretKey: undefined}});
  },
  deleteAccount: async(id) => {
    db.update(schema.accounts).set({deletedAt: new Date()}).where(eq(schema.accounts.id, id)).run();
  },
}));

export const useEditAccount = () => useEditAccountStore(state => ({
  account: state.account,
  setAccount: state.setAccount,
  updateAccount: state.updateAccount,
  insertAccount: state.insertAccount,
  deleteAccount: state.deleteAccount,
}));

const useAccountSyncStore = create((set, get) => ({
  isSyncing: false,
  syncError: null,
  startSync: async(userInfo, serverUrl, token) => {
    if (get().isSyncing) {return;}

    set({isSyncing: true, syncError: null});
    try {
      await syncWithCloud(db, userInfo, serverUrl, token);
    } catch (error) {
      set({syncError: error.message});
    } finally {
      set({isSyncing: false});
    }
    return get().syncError;
  },
  clearSyncError: () => set({syncError: null}),
}));

export const useAccountSync = () => useAccountSyncStore(state => ({
  isSyncing: state.isSyncing,
  syncError: state.syncError,
  startSync: state.startSync,
  clearSyncError: state.clearSyncError,
}));

const useUpdateAccountTokenStore = create(() => ({
  updateToken: async(id) => {
    const account = db.select().from(schema.accounts)
      .where(eq(schema.accounts.id, Number(id))).limit(1).get();
    if (account) {
      db.update(schema.accounts).set({token: generateToken(account.secretKey)}).where(eq(schema.accounts.id, id)).run();
    }
  },
}));

export const useUpdateAccountToken = () => useUpdateAccountTokenStore(state => ({
  updateToken: state.updateToken,
}));
