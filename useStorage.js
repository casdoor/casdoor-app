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
import {createJSONStorage, persist} from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const asyncStoragePersistConfig = {
  setItem: async(key, value) => await AsyncStorage.setItem(key, value),
  getItem: async(key) => await AsyncStorage.getItem(key),
  removeItem: async(key) => await AsyncStorage.removeItem(key),
};

const useStore = create(
  persist(
    (set, get) => ({
      serverUrl: "",
      clientId: "",
      redirectPath: "http://casdoor-authenticator",
      appName: "",
      organizationName: "",
      signinPath: "/api/signin",
      userInfo: null,
      token: null,
      setServerUrl: (url) => set({serverUrl: url}),
      setClientId: (id) => set({clientId: id}),
      setRedirectPath: (path) => set({redirectPath: path}),
      setAppName: (name) => set({appName: name}),
      setOrganizationName: (name) => set({organizationName: name}),
      setSigninPath: (path) => set({signinPath: path}),
      setUserInfo: (info) => set({userInfo: info}),
      setToken: (token) => set({token: token}),
      clearAll: () => set({userInfo: null, token: null}),

      getCasdoorConfig: () => ({
        serverUrl: get().serverUrl,
        clientId: get().clientId,
        appName: get().appName,
        organizationName: get().organizationName,
        redirectPath: get().redirectPath,
        signinPath: get().signinPath,
      }),
      setCasdoorConfig: (config) => set({
        serverUrl: config.serverUrl || get().serverUrl,
        clientId: config.clientId || get().clientId,
        appName: config.appName || get().appName,
        organizationName: config.organizationName || get().organizationName,
        redirectPath: config.redirectPath || get().redirectPath,
        signinPath: config.signinPath || get().signinPath,
      }),
    }),
    {
      name: "casdoor-storage",
      storage: createJSONStorage(() => asyncStoragePersistConfig),
    }
  )
);

export default useStore;
