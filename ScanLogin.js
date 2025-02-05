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

import React from "react";
import PropTypes from "prop-types";
import * as Clipboard from "expo-clipboard";
import QRScanner from "./QRScanner";
import {Button} from "react-native-paper";
import i18next from "i18next";

const ScanQRCodeForLogin = ({onClose, showScanner, onLogin, onError}) => {
  const handleClipboardPaste = async() => {
    const text = await Clipboard.getStringAsync();
    if (!isValidLoginQR(text)) {
      onError?.(i18next.t("scanLogin.Invalid QR code format"));
      return;
    }

    const loginInfo = parseLoginQR(text);
    if (!loginInfo) {
      onError?.(i18next.t("scanLogin.Missing required fields: serverUrl and accessToken"));
      return;
    }

    onLogin(loginInfo);
    onClose();
  };

  const handleScan = (type, data) => {
    if (!isValidLoginQR(data)) {
      onError?.(i18next.t("scanLogin.Invalid QR code format"));
      return;
    }

    const loginInfo = parseLoginQR(data);
    if (!loginInfo) {
      onError?.(i18next.t("scanLogin.Missing required fields: serverUrl and accessToken"));
      return;
    }

    onLogin(loginInfo);
    onClose();
  };

  const isValidLoginQR = (data) => {
    return data.startsWith("casdoor-authenticator://login?");
  };

  const parseLoginQR = (data) => {
    try {
      const url = new URL(data);
      const params = new URLSearchParams(url.search);

      const serverUrl = params.get("serverUrl");
      const accessToken = params.get("accessToken");

      if (!serverUrl || !accessToken) {
        throw new Error(i18next.t("scanLogin.Missing required fields"));
      }

      return {
        serverUrl,
        accessToken,
      };
    } catch (error) {
      return null;
    }
  };

  if (!showScanner) {
    return null;
  }

  return (
    <QRScanner onScan={handleScan} onClose={onClose}>
      <Button
        icon="clipboard"
        mode="contained"
        onPress={handleClipboardPaste}
        style={{flex: 1}}
      >
        {i18next.t("scanLogin.Paste QR Code")}
      </Button>
    </QRScanner>
  );
};

ScanQRCodeForLogin.propTypes = {
  onClose: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onError: PropTypes.func,
  showScanner: PropTypes.bool.isRequired,
};

export default ScanQRCodeForLogin;
