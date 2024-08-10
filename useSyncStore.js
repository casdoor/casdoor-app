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

import {create} from "zustand";
import * as TotpDatabase from "./TotpDatabase";

const useSyncStore = create((set, get) => ({
  isSyncing: false,
  syncError: null,

  startSync: async(db, userInfo, casdoorServer, token) => {
    if (!get().isSyncing) {
      set({isSyncing: true, syncError: null});
      try {
        await TotpDatabase.syncWithCloud(db, userInfo, casdoorServer, token);
      } catch (error) {
        set({syncError: error.message});
      } finally {
        set({isSyncing: false});
      }
    }
  },

  clearSyncError: () => set({syncError: null}),
}));

export default useSyncStore;
