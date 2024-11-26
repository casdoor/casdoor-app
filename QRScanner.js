// Copyright 2024 The Casdoor Authors. All Rights Reserved.
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
import {useTranslation} from "react-i18next";

const QRScanner = ({onScan, onClose, children}) => {
  const {t} = useTranslation();
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    const getPermissions = async() => {
      const {status: cameraStatus} = await Camera.requestCameraPermissionsAsync();
      setHasPermission(cameraStatus === "granted");
    };

    getPermissions();
  }, []);

  const handleBarCodeScanned = ({type, data}) => {
    onScan(type, data);
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
    return <Text style={{margin: "20%"}}>{t("qrScanner.Requesting permissions")}</Text>;
  }

  if (hasPermission === false) {
    return <Text style={{margin: "20%"}}>{t("qrScanner.No access to camera or media library")}</Text>;
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
        <View style={{
          position: "absolute",
          bottom: 40,
          left: 20,
          right: 20,
          flexDirection: "row",
          justifyContent: children ? "space-evenly" : "center",
          gap: 16,
        }}>
          <Button
            icon="image"
            mode="contained"
            onPress={pickImage}
            style={children ? {flex: 1} : {width: 200}}
          >
            {t("qrScanner.Choose Image")}
          </Button>
          {children}
        </View>
      </Portal>
    </View>
  );
};

QRScanner.propTypes = {
  onScan: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default QRScanner;
