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

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import {openDatabaseSync} from "expo-sqlite";
import i18next from "i18next";

const SQLITE_DIR = `${FileSystem.documentDirectory}SQLite`;

const getRandomDBName = () => {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  return `${randomString}_${timestamp}.db`;
};

const createDirectory = async(dir) => {
  try {
    if (!(await FileSystem.getInfoAsync(dir)).exists) {
      await FileSystem.makeDirectoryAsync(dir, {intermediates: true});
    }
  } catch (error) {
    throw new Error(`${i18next.t("msAuthImport.Error creating directory")}: ${error.message}`);
  }
};

const queryMicrosoftAuthenticatorDatabase = async(db) => {
  return await db.getAllAsync("SELECT name, username, oath_secret_key FROM accounts WHERE account_type = 0");
};

const formatMicrosoftAuthenticatorData = (rows) => {
  return rows.map(row => {
    const {name, username, oath_secret_key} = row;
    return {issuer: name, accountName: username, secretKey: oath_secret_key};
  });
};

export const importFromMSAuth = async() => {
  const dbName = getRandomDBName();
  const internalDbName = `${SQLITE_DIR}/${dbName}`;
  try {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: false,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      if ((await FileSystem.getInfoAsync(file.uri)).exists) {
        await createDirectory(SQLITE_DIR);
        await FileSystem.copyAsync({from: file.uri, to: internalDbName});

        try {
          const db = openDatabaseSync(dbName);

          const rows = await queryMicrosoftAuthenticatorDatabase(db);
          if (rows.length === 0) {
            throw new Error(i18next.t("msAuthImport.No data found in Microsoft Authenticator database"));
          }
          return formatMicrosoftAuthenticatorData(rows);
        } catch (dbError) {
          if (dbError.message.includes("file is not a database")) {
            throw new Error(i18next.t("msAuthImport.file is not a database"));
          }
          throw new Error(dbError.message);
        }
      }
    }
  } catch (error) {
    throw new Error(`${i18next.t("msAuthImport.Error importing from Microsoft Authenticator")}: ${error.message}`);
  } finally {
    await FileSystem.deleteAsync(internalDbName, {idempotent: true});
  }
};
