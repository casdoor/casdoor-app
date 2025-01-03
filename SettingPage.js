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
import {Dimensions, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {Avatar, Button, IconButton, List, Surface, Text, useTheme} from "react-native-paper";
import {ActionSheetProvider} from "@expo/react-native-action-sheet";
import * as Application from "expo-application";
import {useTranslation} from "react-i18next";
import Constants, {ExecutionEnvironment} from "expo-constants";
import {SvgUri} from "react-native-svg";

import CasdoorLoginPage, {useCasdoorLogout} from "./CasdoorLoginPage";
import LoginMethodSelector from "./LoginMethodSelector";
import useStore from "./useStorage";
import {Language} from "./Language";

const {width} = Dimensions.get("window");

const SettingPage = () => {
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [loginMethod, setLoginMethod] = useState(null);
  const {userInfo, clearAll} = useStore();
  const theme = useTheme();
  const {t} = useTranslation();
  const logout = useCasdoorLogout();
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
    logout();
    clearAll();
  };

  return (
    <ActionSheetProvider>
      <ScrollView style={styles.scrollView}>
        <Surface style={styles.container} elevation={0}>
          <Surface style={styles.profileCard} elevation={1}>
            {userInfo ? (
              <View style={styles.profileInfo}>
                {userInfo.avatar?.endsWith(".svg") ? (
                  <View style={{width: 60, height: 60}}>
                    <SvgUri
                      width="60"
                      height="60"
                      uri={userInfo.avatar}
                    />
                  </View>
                ) : (
                  <Avatar.Image
                    size={60}
                    source={{uri: userInfo.avatar}}
                  />
                )}
                <View style={styles.profileText}>
                  <Text variant="titleLarge">{userInfo.name}</Text>
                  <Text variant="bodyMedium" style={{color: theme.colors.secondary}}>
                    {userInfo.email}
                  </Text>
                </View>
                <IconButton
                  icon="logout"
                  mode="contained-tonal"
                  onPress={handleCasdoorLogout}
                  style={styles.logoutButton}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.profileCard}
                onPress={handleCasdoorLogin}
              >
                <Button
                  icon="login"
                  style={styles.loginButton}
                  labelStyle={styles.loginButtonLabel}
                >
                  {t("settings.Sign In")}
                </Button>
              </TouchableOpacity>
            )}
          </Surface>

          {/* Settings Sections */}
          <List.Section>
            <List.Subheader>{t("settings.Preferences")}</List.Subheader>

            <List.Item
              title={t("settings.Language")}
              left={props => <List.Icon {...props} icon="translate" />}
              right={() => <Language />}
            />

          </List.Section>

          <List.Section>
            <List.Subheader>{t("settings.About")}</List.Subheader>

            <List.Item
              title={t("settings.Version")}
              description={
                Constants.executionEnvironment === ExecutionEnvironment.Standalone
                  ? Application.nativeApplicationVersion
                  : Constants.expoConfig?.version
              }
              left={props => <List.Icon {...props} icon="information" />}
            />

            {process.env.EXPO_PUBLIC_COMMIT_HASH && (
              <List.Item
                title={t("settings.Commit Hash")}
                description={process.env.EXPO_PUBLIC_COMMIT_HASH.slice(0, 7)}
                left={props => <List.Icon {...props} icon="git" />}
              />
            )}

          </List.Section>
        </Surface>

        {showLoginPage && (
          <CasdoorLoginPage
            onWebviewClose={handleHideLoginPage}
            initialMethod={loginMethod}
          />
        )}
      </ScrollView>
    </ActionSheetProvider>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  container: {
    flex: 1,
    padding: 16,
    width: width > 600 ? 600 : "100%",
    alignSelf: "center",
    backgroundColor: "#F2F2F2",
  },
  profileCard: {
    padding: 10,
    borderRadius: 14,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  profileText: {
    flex: 1,
    marginLeft: 16,
  },
  loginButton: {
    borderRadius: 8,
    alignSelf: "center",
  },
  loginButtonLabel: {
    fontSize: 18,
  },
  logoutButton: {
    marginLeft: 8,
  },
});

export default SettingPage;
