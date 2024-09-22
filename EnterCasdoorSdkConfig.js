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
import {ScrollView, Text, View} from "react-native";
import {Button, IconButton, Portal, TextInput} from "react-native-paper";
import {useNotifications} from "react-native-notificated";
import SDK from "casdoor-react-native-sdk";
import DefaultCasdoorSdkConfig from "./DefaultCasdoorSdkConfig";
import PropTypes from "prop-types";
import ScanQRCodeForLogin from "./ScanLogin";
import useStore from "./useStorage";

const EnterCasdoorSdkConfig = ({onClose, onWebviewClose}) => {
  EnterCasdoorSdkConfig.propTypes = {
    onClose: PropTypes.func.isRequired,
    onWebviewClose: PropTypes.func.isRequired,
  };

  const {
    serverUrl,
    clientId,
    redirectPath,
    appName,
    organizationName,
    setServerUrl,
    setClientId,
    setAppName,
    setOrganizationName,
    setCasdoorConfig,
    getCasdoorConfig,
    setToken,
    setUserInfo,
  } = useStore();

  const {notify} = useNotifications();

  const [showScanner, setShowScanner] = useState(false);

  const closeConfigPage = () => {
    onClose();
    onWebviewClose();
  };

  const handleSave = () => {
    if (!serverUrl || !clientId || !appName || !organizationName || !redirectPath) {
      notify("error", {
        params: {
          title: "Error",
          description: "Please fill in all the fields!",
        },
      });
      return;
    }
    onClose();
  };

  const handleScanToLogin = () => {
    setShowScanner(true);
  };

  const handleLogin = (loginInfo) => {
    setServerUrl(loginInfo.serverUrl);
    setClientId("");
    setAppName("");
    setOrganizationName("");

    const sdk = new SDK(getCasdoorConfig());

    try {
      const accessToken = loginInfo.accessToken;
      const userInfo = sdk.JwtDecode(accessToken);
      setToken(accessToken);
      setUserInfo(userInfo);

      notify("success", {
        params: {
          title: "Success",
          description: "Logged in successfully!",
        },
      });

      setShowScanner(false);
      onClose();
      onWebviewClose();
    } catch (error) {
      notify("error", {
        params: {
          title: "Error in login",
          description: error,
        },
      });
    }
  };

  const handleUseDefault = () => {
    setCasdoorConfig(DefaultCasdoorSdkConfig);
    onClose();
  };

  return (
    <Portal>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Casdoor server</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={closeConfigPage}
              style={styles.closeButton}
            />
          </View>
          <TextInput
            label="Endpoint"
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Client ID"
            value={clientId}
            onChangeText={setClientId}
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="App Name"
            value={appName}
            onChangeText={setAppName}
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Organization Name"
            value={organizationName}
            onChangeText={setOrganizationName}
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
          />
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              onPress={handleSave}
              style={[styles.button, styles.confirmButton]}
              labelStyle={styles.buttonLabel}
            >
              Confirm
            </Button>
            <Button
              mode="contained"
              onPress={handleScanToLogin}
              style={[styles.button, styles.scanButton]}
              labelStyle={styles.buttonLabel}
            >
              Scan to Login
            </Button>
          </View>
          <Button
            mode="outlined"
            onPress={handleUseDefault}
            style={[styles.button, styles.outlinedButton]}
            labelStyle={styles.outlinedButtonLabel}
          >
            Try with Casdoor Demo Site
          </Button>
        </View>
      </ScrollView>
      {showScanner && (
        <ScanQRCodeForLogin
          showScanner={showScanner}
          onClose={() => setShowScanner(false)}
          onLogin={handleLogin}
        />
      )}
    </Portal>
  );
};

const styles = {
  scrollContainer: {
    flexGrow: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  content: {
    width: "95%",
    borderRadius: 10,
    padding: 20,
    backgroundColor: "#F5F5F5",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    marginVertical: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 12,
  },
  button: {
    borderRadius: 5,
    paddingVertical: 8,
  },
  confirmButton: {
    backgroundColor: "#6200EE",
    flex: 1,
    marginRight: 5,
  },
  scanButton: {
    backgroundColor: "#03DAC6",
    flex: 1,
    marginLeft: 5,
  },
  buttonLabel: {
    fontSize: 16,
    color: "white",
  },
  outlinedButton: {
    borderColor: "#6200EE",
    borderWidth: 1,
    width: "100%",
  },
  outlinedButtonLabel: {
    color: "#6200EE",
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    position: "relative",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: -8,
  },
};

export default EnterCasdoorSdkConfig;
