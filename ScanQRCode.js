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
import {Text, View} from "react-native";
import {Button, IconButton, Portal} from "react-native-paper";
import {Camera, CameraView, scanFromURLAsync} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import PropTypes from "prop-types";
import useProtobufDecoder from "./useProtobufDecoder";

const ScanQRCode = ({onClose, showScanner, onAdd}) => {
  ScanQRCode.propTypes = {
    onClose: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    showScanner: PropTypes.bool.isRequired,
  };

  const [hasPermission, setHasPermission] = useState(null);
  const decoder = useProtobufDecoder(require("./google/google_auth.proto"));

  useEffect(() => {
    const getPermissions = async() => {
      const {status: cameraStatus} = await Camera.requestCameraPermissionsAsync();
      setHasPermission(cameraStatus === "granted");
      // const {status: mediaLibraryStatus} = await ImagePicker.requestMediaLibraryPermissionsAsync();
      // setHasMediaLibraryPermission(mediaLibraryStatus === "granted");
    };

    getPermissions();
  }, []);

  const handleBarCodeScanned = ({type, data}) => {
    // console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
    const supportedProtocols = ["otpauth", "otpauth-migration"];
    const protocolMatch = data.match(new RegExp(`^(${supportedProtocols.join("|")}):`));
    if (protocolMatch) {
      const protocol = protocolMatch[1];
      switch (protocol) {
      case "otpauth":
        handleOtpAuth(data);
        break;
      case "otpauth-migration":
        handleGoogleMigration(data);
        break;
      default:
        return;
      }
      onClose();
    }
  };

  const handleOtpAuth = (data) => {
    const [, accountName] = data.match(/otpauth:\/\/totp\/([^?]+)/) || [];
    const [, secretKey] = data.match(/secret=([^&]+)/) || [];
    const [, issuer] = data.match(/issuer=([^&]+)/) || [];

    if (accountName && secretKey) {
      onAdd({accountName, issuer: issuer || null, secretKey});
    }
  };

  const handleGoogleMigration = (data) => {
    const accounts = decoder.decodeExportUri(data);
    onAdd(accounts.map(({accountName, issuer, totpSecret}) => ({accountName, issuer, secretKey: totpSecret})));
  };

  const pickImage = async() => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const scannedData = await scanFromURLAsync(result.assets[0].uri, ["qr", "pdf417"]);
      if (scannedData[0]) {
        handleBarCodeScanned({type: scannedData[0].type, data: scannedData[0].data});
      }
    }
  };

  if (hasPermission === null) {
    return <Text style={{margin: "20%"}}>Requesting permissions...</Text>;
  }

  if (hasPermission === false) {
    return <Text style={{margin: "20%"}}>No access to camera or media library</Text>;
  }

  return (
    <View style={{marginTop: "50%", flex: 1}}>
      <Portal>
        <CameraView
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417"],
          }}
          style={{flex: 1}}
        />
        <IconButton
          icon="close"
          size={40}
          onPress={onClose}
          style={{position: "absolute", top: 30, right: 5}}
        />
        <Button
          icon="image"
          mode="contained"
          onPress={pickImage}
          style={{position: "absolute", bottom: 20, alignSelf: "center"}}
        >
          Choose Image
        </Button>
      </Portal>
    </View>
  );
};

export default ScanQRCode;
