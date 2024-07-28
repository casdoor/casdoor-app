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
import {Appbar, Avatar, Button, Menu, Text} from "react-native-paper";
import UserContext from "./UserContext";
import {StyleSheet, View} from "react-native";
import CasdoorLoginPage, {CasdoorLogout} from "./CasdoorLoginPage";

const Header = () => {
  const {userInfo, setUserInfo, setToken} = React.useContext(UserContext);
  const [showLoginPage, setShowLoginPage] = React.useState(false);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const handleMenuLogoutClicked = () => {
    handleCasdoorLogout();
    closeMenu();
  };

  const handleCasdoorLogin = () => {
    setShowLoginPage(true);
  };
  const handleCasdoorLogout = () => {
    CasdoorLogout();
    setUserInfo(null);
    setToken(null);
  };
  const handleHideLoginPage = () => {
    setShowLoginPage(false);
  };

  return (
    <View>
      <Appbar.Header style={{height: 40}}>
        <View style={[StyleSheet.absoluteFill, {alignItems: "center", justifyContent: "center"}]} pointerEvents="box-none">
          <Appbar.Content title="Casdoor" style={{
            alignItems: "center",
            justifyContent: "center",
          }} />
        </View>
        <View style={{flex: 1}} />
        <Menu
          visible={menuVisible}
          anchor={
            <Button
              style={{
                marginRight: 2,
                backgroundColor: "transparent",
                height: 40,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={userInfo === null ? handleCasdoorLogin : openMenu}
            >
              <View style={{flexDirection: "row", alignItems: "center"}}>
                <View style={{position: "relative", height: 32, justifyContent: "flex-end", marginRight: 8}}>
                  <Text variant="titleMedium">
                    {userInfo === null ? "Login" : userInfo.name}
                  </Text>
                </View>
                {userInfo !== null && (
                  <Avatar.Image
                    size={32}
                    source={{uri: userInfo.avatar}}
                    style={{backgroundColor: "transparent"}}
                  />
                )}
              </View>
            </Button>
          }
          onDismiss={closeMenu}
        >
          <Menu.Item onPress={() => handleMenuLogoutClicked()} title="Logout" />
        </Menu>
      </Appbar.Header>
      {showLoginPage && <CasdoorLoginPage onWebviewClose={handleHideLoginPage} />}
    </View>
  );
};

export default Header;
