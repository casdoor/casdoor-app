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
import {Alert, Text, View} from "react-native";
import {Button, IconButton, Portal, TextInput} from "react-native-paper";
import DefaultCasdoorSdkConfig from "./DefaultCasdoorSdkConfig";
import CasdoorServerContext from "./CasdoorServerContext";
import PropTypes from "prop-types";

const EnterCasdoorSdkConfig = ({onClose, onWebviewClose}) => {
  EnterCasdoorSdkConfig.propTypes = {
    onClose: PropTypes.func.isRequired,
  };
  const {setCasdoorServer} = React.useContext(CasdoorServerContext);

  const [CasdoorSdkConfig, setCasdoorSdkConfig] = useState({
    serverUrl: "",
    clientId: "",
    appName: "",
    organizationName: "",
    redirectPath: "http://casdoor-app",
    signinPath: "/api/signin",
  });

  const handleInputChange = (key, value) => {
    setCasdoorSdkConfig({...CasdoorSdkConfig, [key]: value});
  };

  const closeConfigPage = () => {
    onClose();
    onWebviewClose();
  };
  const handleSave = () => {
    if (
      !CasdoorSdkConfig.serverUrl ||
      !CasdoorSdkConfig.clientId ||
      !CasdoorSdkConfig.appName ||
      !CasdoorSdkConfig.organizationName ||
      !CasdoorSdkConfig.redirectPath
    ) {
      Alert.alert("Please fill in all the fields!");
      return;
    }
    setCasdoorServer(CasdoorSdkConfig);
    onClose();
  };
  const handleUseDefault = () => {
    setCasdoorServer(DefaultCasdoorSdkConfig);
    onClose();
  };

  return (
    <Portal>
      <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white"}}>
        <View style={{top: -60, flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white"}}>
          <Text style={{fontSize: 24, marginBottom: 5}}>Casdoor server</Text>
          <TextInput
            label="Endpoint"
            value={CasdoorSdkConfig.serverUrl}
            onChangeText={(text) => handleInputChange("serverUrl", text)}
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
            value={CasdoorSdkConfig.clientId}
            onChangeText={(text) => handleInputChange("clientId", text)}
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
            value={CasdoorSdkConfig.appName}
            onChangeText={(text) => handleInputChange("appName", text)}
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
            value={CasdoorSdkConfig.organizationName}
            onChangeText={(text) => handleInputChange("organizationName", text)}
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
