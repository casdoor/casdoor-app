// Copyright 2023 The Casdoor Authors. All Rights Reserved.
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

import * as React from "react";
import {PaperProvider} from "react-native-paper";
import {NavigationContainer} from "@react-navigation/native";
import {BulletList} from "react-content-loader/native";
import {SQLiteProvider} from "expo-sqlite";
import Toast from "react-native-toast-message";
import Header from "./Header";
import NavigationBar from "./NavigationBar";
import {migrateDb} from "./TotpDatabase";

const App = () => {
  return (
    <React.Suspense fallback={<BulletList />}>
      <SQLiteProvider databaseName="totp.db" onInit={migrateDb} options={{enableChangeListener: true}}>
        <NavigationContainer>
          <PaperProvider>
            <Header />
            <NavigationBar />
          </PaperProvider>
        </NavigationContainer>
        <Toast />
      </SQLiteProvider>
    </React.Suspense>
  );
};
export default App;
