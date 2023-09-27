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
import {Button} from "react-native-paper";
import {View} from "react-native";
import CasdoorLoginPage, {CasdoorLogout} from "./CasdoorLoginPage";
import UserContext from "./UserContext";

const SettingPage = () => {
  const [showLoginPage, setShowLoginPage] = React.useState(false);
  const {userInfo, setUserInfo} = React.useContext(UserContext);
  const handleCasdoorLogin = () => {
    setShowLoginPage(true);
  };
  const handleCasdoorLogout = () => {
    CasdoorLogout();
    setUserInfo(null);
  };
  const handleHideLoginPage = () => {
    setShowLoginPage(false);
  };

  return (
    <View>
      <Button
        style={{marginTop: "50%", marginLeft: "20%", marginRight: "20%"}}
        icon={userInfo === null ? "login" : "logout"}
        mode="contained"
        onPress={userInfo === null ? handleCasdoorLogin : handleCasdoorLogout}
      >
        {userInfo === null ? "Login with Casdoor" : "Logout"}
      </Button>
      {showLoginPage && <CasdoorLoginPage onWebviewClose={handleHideLoginPage} />}
    </View>
  );
};

export default SettingPage;
