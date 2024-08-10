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
import {Alert, Text, View} from "react-native";
import {Button, IconButton, Portal, TextInput} from "react-native-paper";
import DefaultCasdoorSdkConfig from "./DefaultCasdoorSdkConfig";
import PropTypes from "prop-types";
import useStore from "./useStorage";

const EnterCasdoorSdkConfig = ({onClose, onWebviewClose}) => {
  EnterCasdoorSdkConfig.propTypes = {
    onClose: PropTypes.func.isRequired,
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
  } = useStore();

  const closeConfigPage = () => {
    onClose();
    onWebviewClose();
  };

  const handleSave = () => {
    if (!serverUrl || !clientId || !appName || !organizationName || !redirectPath) {
      Alert.alert("Please fill in all the fields!");
      return;
    }
    onClose();
  };

  const handleUseDefault = () => {
    setCasdoorConfig(DefaultCasdoorSdkConfig);
    onClose();
  };

  return (
    <Portal>
      <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white"}}>
        <View style={{top: -60, flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white"}}>
          <Text style={{fontSize: 24, marginBottom: 5}}>Casdoor server</Text>
          <TextInput
            label="Endpoint"
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
            style={{
              borderWidth: 3,
              borderColor: "white",
              margin: 10,
              width: 300,
              height: 50,
              borderRadius: 5,
              fontSize: 18,
              color: "gray",
              paddingLeft: 10,
            }}
          />
          <TextInput
            label="ClientID"
            value={clientId}
            onChangeText={setClientId}
            autoCapitalize="none"
            style={{
              borderWidth: 3,
              borderColor: "white",
              margin: 10,
              width: 300,
              height: 50,
              borderRadius: 5,
              fontSize: 18,
              color: "gray",
              paddingLeft: 10,
            }}
          />
          <TextInput
            label="appName"
            value={appName}
            onChangeText={setAppName}
            autoCapitalize="none"
            style={{
              borderWidth: 3,
              borderColor: "white",
              margin: 10,
              width: 300,
              height: 50,
              borderRadius: 5,
              fontSize: 18,
              color: "gray",
              paddingLeft: 10,
            }}
          />
          <TextInput
            label="organizationName"
            value={organizationName}
            onChangeText={setOrganizationName}
            autoCapitalize="none"
            style={{
              borderWidth: 3,
              borderColor: "white",
              margin: 10,
              width: 300,
              height: 50,
              borderRadius: 5,
              fontSize: 18,
              color: "gray",
              paddingLeft: 10,
            }}
          />
          <Button
            mode="contained"
            onPress={handleSave}
            style={{
              backgroundColor: "#E6DFF3",
              borderRadius: 5,
              margin: 10,
              alignItems: "center",
              position: "absolute",
              top: 600,
              width: 300,
              height: 50,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Text style={{fontSize: 21, width: 300, color: "black"}}>Confirm</Text>
          </Button>
          <Button
            mode="contained"
            onPress={handleUseDefault}
            style={{
              backgroundColor: "#E6DFF3",
              borderRadius: 5,
              margin: 10,
              alignItems: "center",
              position: "absolute",
              top: 660,
              width: 300,
            }}
          >
            <Text style={{fontSize: 18, width: 300, color: "black"}}>Use Casdoor Demo Site</Text>
          </Button>
          <IconButton icon={"close"} size={30} onPress={closeConfigPage} style={{position: "absolute", top: 120, right: -30}} />
        </View>
      </View>
    </Portal>
  );
};

export default EnterCasdoorSdkConfig;
