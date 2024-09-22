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
import QRScanner from "./QRScanner";

const ScanQRCodeForLogin = ({onClose, showScanner, onLogin}) => {
  const handleScan = (type, data) => {
    if (isValidLoginQR(data)) {
      const loginInfo = parseLoginQR(data);
      onLogin(loginInfo);
      onClose();
    }
  };

  const isValidLoginQR = (data) => {
    return data.startsWith("casdoor-app://login?");
  };

  const parseLoginQR = (data) => {
    const url = new URL(data);
    const params = new URLSearchParams(url.search);

    return {
      // clientId: params.get("clientId"),
      // appName: params.get("appName"),
      // organizationName: params.get("organizationName"),
      serverUrl: params.get("serverUrl"),
      accessToken: params.get("accessToken"),
    };
  };

  if (!showScanner) {
    return null;
  }

  return <QRScanner onScan={handleScan} onClose={onClose} />;
};

ScanQRCodeForLogin.propTypes = {
  onClose: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  showScanner: PropTypes.bool.isRequired,
};

export default ScanQRCodeForLogin;
