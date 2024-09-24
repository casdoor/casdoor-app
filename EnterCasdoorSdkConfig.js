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

import React from "react";
import {StyleSheet, Text, View} from "react-native";
import {Button, Portal, TextInput} from "react-native-paper";
import {useNotifications} from "react-native-notificated";
import PropTypes from "prop-types";
import useStore from "./useStorage";

function EnterCasdoorSdkConfig({onClose, onWebviewClose}) {
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
  } = useStore();

  const {notify} = useNotifications();

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

  return (
    <Portal>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Casdoor Configuration</Text>
          <View style={styles.formContainer}>
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
          </View>
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={closeConfigPage}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Confirm
            </Button>
          </View>
        </View>
      </View>
    </Portal>
  );
}

EnterCasdoorSdkConfig.propTypes = {
  onClose: PropTypes.func.isRequired,
  onWebviewClose: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 28,
    padding: 24,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Lato-Bold",
    color: "#212121",
    textAlign: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 100,
  },
  buttonLabel: {
    paddingVertical: 4,
    fontSize: 16,
    fontWeight: "bold",
  },
  formContainer: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
});

export default EnterCasdoorSdkConfig;
