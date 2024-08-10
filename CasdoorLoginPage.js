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

import React, {useEffect, useState} from "react";
import {WebView} from "react-native-webview";
import {View} from "react-native";
import {Portal} from "react-native-paper";
import SDK from "casdoor-react-native-sdk";
import PropTypes from "prop-types";
import EnterCasdoorSdkConfig from "./EnterCasdoorSdkConfig";
import useStore from "./useStorage";
// import {LogBox} from "react-native";
// LogBox.ignoreAllLogs();

let sdk = null;
const CasdoorLoginPage = ({onWebviewClose}) => {
  CasdoorLoginPage.propTypes = {
    onWebviewClose: PropTypes.func.isRequired,
  };
  const [casdoorLoginURL, setCasdoorLoginURL] = useState("");
  const [showConfigPage, setShowConfigPage] = useState(true);

  const {
    serverUrl,
    clientId,
    redirectPath,
    appName,
    organizationName,
    getCasdoorConfig,
    setUserInfo,
    setToken,
  } = useStore();

  const handleHideConfigPage = () => {
    setShowConfigPage(false);
  };
  const getCasdoorSignInUrl = async() => {
    const signinUrl = await sdk.getSigninUrl();
    setCasdoorLoginURL(signinUrl);
  };

  useEffect(() => {
    if (serverUrl && clientId && redirectPath && appName && organizationName) {
      sdk = new SDK(getCasdoorConfig());
      getCasdoorSignInUrl();
    }
  }, [serverUrl, clientId, redirectPath, appName, organizationName]);

  const onNavigationStateChange = async(navState) => {
    const {redirectPath} = getCasdoorConfig();
    if (navState.url.startsWith(redirectPath)) {
      onWebviewClose();
      const token = await sdk.getAccessToken(navState.url);
      const userInfo = sdk.JwtDecode(token);
      setToken(token);
      setUserInfo(userInfo);
    }
  };

  return (
    <Portal>
      <View style={{flex: 1}}>
        {showConfigPage && <EnterCasdoorSdkConfig onClose={handleHideConfigPage} onWebviewClose={onWebviewClose} />}
        {!showConfigPage && casdoorLoginURL !== "" && (
          <WebView
            source={{uri: casdoorLoginURL}}
            onNavigationStateChange={onNavigationStateChange}
            style={{flex: 1}}
            mixedContentMode="always"
            javaScriptEnabled={true}
          />
        )}
      </View>
    </Portal>
  );
};

export const CasdoorLogout = () => {
  if (sdk) {sdk.clearState();}
};

export default CasdoorLoginPage;
