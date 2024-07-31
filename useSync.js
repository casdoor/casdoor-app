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

import {useCallback, useEffect, useState} from "react";
import * as api from "./api";
import {useNetInfo} from "@react-native-community/netinfo";

export const SYNC_STATUS = {
  ADD: "add",
  EDIT: "edit",
  DELETE: "delete",
};

const applySync = (serverAccountList, toSyncData) => {
  return toSyncData.reduce((acc, syncItem) => {
    switch (syncItem.status) {
    case SYNC_STATUS.ADD:
      if (!acc.some(account => account.accountName === syncItem.data.accountName && account.secretKey === syncItem.data.secretKey)) {
        acc.push(syncItem.data);
      }
      break;
    case SYNC_STATUS.EDIT:
      const indexToEdit = acc.findIndex(account => account.accountName === syncItem.data.accountName && account.secretKey === syncItem.data.secretKey);
      if (indexToEdit !== -1) {
        acc[indexToEdit] = {...acc[indexToEdit], ...syncItem.data, accountName: syncItem.newAccountName};
      }
      break;
    case SYNC_STATUS.DELETE:
      return acc.filter(account => !(account.accountName === syncItem.data.accountName && account.secretKey === syncItem.data.secretKey));
    default:
      break;
    }
    return acc;
  }, [...serverAccountList]);
};

const useSync = (userInfo, token, casdoorServer) => {
  const [toSyncData, setToSyncData] = useState([]);
  const [syncSignal, setSyncSignal] = useState(false);
  const {isConnected} = useNetInfo();
  const [canSync, setCanSync] = useState(false);

  useEffect(() => {
    setCanSync(userInfo && casdoorServer && isConnected);
  }, [userInfo, casdoorServer, isConnected]);

  const triggerSync = useCallback(() => {
    if (canSync) {
      setSyncSignal(true);
    }
  }, [canSync]);

  const resetSyncSignal = useCallback(() => {
    setSyncSignal(false);
  }, []);

  const addToSyncData = useCallback((toSyncAccount, status, newAccountName = null) => {
    setToSyncData([...toSyncData, {
      data: {
        accountName: toSyncAccount.accountName,
        issuer: toSyncAccount.issuer,
        secretKey: toSyncAccount.secretKey,
      },
      status,
      newAccountName: newAccountName || "",
    }]);
  }, []);

  const syncAccounts = useCallback(async() => {
    if (!canSync) {return {success: false, error: "Cannot sync"};}

    try {
      const {mfaAccounts: serverAccountList} = await api.getMfaAccounts(
        casdoorServer.serverUrl,
        userInfo.owner,
        userInfo.name,
        token
      );

      if (!serverAccountList) {
        return {success: false, error: "Failed to get accounts"};
      }

      if (toSyncData.length === 0) {
        return {success: true, accountList: serverAccountList};
      }

      const updatedServerAccountList = applySync(serverAccountList, toSyncData);

      const {status} = await api.updateMfaAccounts(
        casdoorServer.serverUrl,
        userInfo.owner,
        userInfo.name,
        updatedServerAccountList,
        token
      );

      if (status === "ok") {setToSyncData([]);}
      return {success: status === "ok", accountList: updatedServerAccountList};

    } catch (error) {
      return {success: false, error: error.message};
    }
  }, [canSync, casdoorServer, userInfo, token, toSyncData]);

  useEffect(() => {
    if (canSync) {triggerSync();}
  }, [canSync, toSyncData]);

  return {
    syncSignal,
    resetSyncSignal,
    syncAccounts,
    addToSyncData,
  };
};

export default useSync;
