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

import React, {useState} from "react";
import {Dimensions, StyleSheet, View} from "react-native";
import {Button, Surface, Text} from "react-native-paper";
import {ActionSheetProvider} from "@expo/react-native-action-sheet";
import CasdoorLoginPage, {CasdoorLogout} from "./CasdoorLoginPage";
import LoginMethodSelector from "./LoginMethodSelector";
import useStore from "./useStorage";

const {width} = Dimensions.get("window");

const SettingPage = () => {
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [loginMethod, setLoginMethod] = useState(null);
  const {userInfo, clearAll} = useStore();

  const {openActionSheet} = LoginMethodSelector({
    onSelectMethod: (method) => {
      setLoginMethod(method);
      setShowLoginPage(true);
    },
  });

  const handleCasdoorLogin = () => {
    openActionSheet();
  };

  const handleHideLoginPage = () => {
    setShowLoginPage(false);
    setLoginMethod(null);
  };

  const handleCasdoorLogout = () => {
    CasdoorLogout();
    clearAll();
  };

  return (
    <ActionSheetProvider>
      <View style={styles.container}>
        <Surface style={styles.surface} elevation={4}>
          <Text style={styles.title}>Account Settings</Text>
          <Button
            style={styles.button}
            icon={userInfo === null ? "login" : "logout"}
            mode="contained"
            onPress={userInfo === null ? handleCasdoorLogin : handleCasdoorLogout}
          >
            {userInfo === null ? "Login with Casdoor" : "Logout"}
          </Button>
        </Surface>
        {showLoginPage && (
          <CasdoorLoginPage
            onWebviewClose={handleHideLoginPage}
            initialMethod={loginMethod}
          />
        )}
      </View>
    </ActionSheetProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  surface: {
    padding: 16,
    width: width > 600 ? 400 : "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
    width: "100%",
  },
});

export default SettingPage;
