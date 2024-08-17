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
import {Dimensions, StyleSheet, View} from "react-native";
import {Appbar, Avatar, Menu, Text, TouchableRipple} from "react-native-paper";
import Toast from "react-native-toast-message";
import CasdoorLoginPage, {CasdoorLogout} from "./CasdoorLoginPage";
import useStore from "./useStorage";
import useSyncStore from "./useSyncStore";

const {width} = Dimensions.get("window");

const Header = () => {
  const {userInfo, clearAll} = useStore();
  const syncError = useSyncStore(state => state.syncError);
  const [showLoginPage, setShowLoginPage] = React.useState(false);
  const [menuVisible, setMenuVisible] = React.useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleMenuLogoutClicked = () => {
    handleCasdoorLogout();
    closeMenu();
  };

  const handleCasdoorLogin = () => setShowLoginPage(true);
  const handleHideLoginPage = () => setShowLoginPage(false);

  const handleCasdoorLogout = () => {
    CasdoorLogout();
    clearAll();
  };

  const handleSyncErrorPress = () => {
    Toast.show({
      type: "error",
      text1: "Sync Error",
      text2: syncError || "An unknown error occurred during synchronization.",
      autoHide: true,
    });
  };

  return (
    <Appbar.Header mode="center-aligned">
      <View style={styles.leftContainer}>
        {true && syncError && (
          <Appbar.Action
            icon="sync-alert"
            color="#E53935"
            size={24}
            onPress={handleSyncErrorPress}
          />
        )}
      </View>
      <Appbar.Content
        title="Casdoor"
        titleStyle={styles.titleText}
        style={styles.titleContainer}
      />
      <View style={styles.rightContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          contentStyle={styles.menuContent}
          anchorPosition="bottom"
          mode="elevated"
          anchor={
            <TouchableRipple
              onPress={userInfo === null ? handleCasdoorLogin : openMenu}
              style={styles.buttonContainer}
            >
              <View style={styles.buttonContent}>
                <Text
                  style={[
                    styles.buttonText,
                    userInfo !== null && {marginRight: 8},
                  ]}
                >
                  {userInfo === null ? "Login" : userInfo.name}
                </Text>
                {userInfo !== null && (
                  <Avatar.Image
                    size={24}
                    source={{uri: userInfo.avatar}}
                    style={styles.avatar}
                  />
                )}
              </View>
            </TouchableRipple>
          }
        >
          <Menu.Item onPress={handleMenuLogoutClicked} title="Logout" />
        </Menu>
      </View>
      {showLoginPage && <CasdoorLoginPage onWebviewClose={handleHideLoginPage} />}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  leftContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingLeft: width * 0.03,
  },
  rightContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingRight: width * 0.03,
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: Math.max(20, width * 0.045),
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: Math.max(14, width * 0.035),
    fontWeight: "bold",
  },
  menuContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  avatar: {
    backgroundColor: "transparent",
  },
});

export default Header;
