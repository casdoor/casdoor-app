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
import {NavigationContainer} from "@react-navigation/native";
import {PaperProvider} from "react-native-paper";
import {SafeAreaView, Text} from "react-native";
import ContentLoader, {Circle, Rect} from "react-content-loader/native";
import Toast from "react-native-toast-message";
import {useMigrations} from "drizzle-orm/expo-sqlite/migrator";

import Header from "./Header";
import NavigationBar from "./NavigationBar";
import {db} from "./db/client";
import migrations from "./drizzle/migrations";

const App = () => {
  const {success, error} = useMigrations(db, migrations);

  if (error) {
    return (
      <SafeAreaView style={{flex: 1}}>
        <Text>Migration error: {error.message}</Text>
      </SafeAreaView>
    );
  }

  if (!success) {
    return (
      <ContentLoader
        speed={2}
        width={400}
        height={150}
        viewBox="0 0 400 150"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <Circle cx="10" cy="20" r="8" />
        <Rect x="25" y="15" rx="5" ry="5" width="220" height="10" />
        <Circle cx="10" cy="50" r="8" />
        <Rect x="25" y="45" rx="5" ry="5" width="220" height="10" />
        <Circle cx="10" cy="80" r="8" />
        <Rect x="25" y="75" rx="5" ry="5" width="220" height="10" />
        <Circle cx="10" cy="110" r="8" />
        <Rect x="25" y="105" rx="5" ry="5" width="220" height="10" />
      </ContentLoader>
    );
  }

  return (
    <NavigationContainer>
      <PaperProvider>
        <Header />
        <NavigationBar />
      </PaperProvider>
      <Toast />
    </NavigationContainer>
  );
};
export default App;
