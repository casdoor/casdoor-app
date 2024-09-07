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
import PropTypes from "prop-types";
import QRScanner from "./QRScanner";
import useProtobufDecoder from "./useProtobufDecoder";

const ScanQRCode = ({onClose, showScanner, onAdd}) => {
  const decoder = useProtobufDecoder(require("./google/google_auth.proto"));

  const handleScan = (type, data) => {
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

  if (!showScanner) {
    return null;
  }

  return <QRScanner onScan={handleScan} onClose={onClose} />;
};

ScanQRCode.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  showScanner: PropTypes.bool.isRequired,
};

export default ScanQRCode;
