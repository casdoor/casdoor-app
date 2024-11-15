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

import {useActionSheet} from "@expo/react-native-action-sheet";
import i18next from "i18next";

const LoginMethodSelector = ({onSelectMethod}) => {
  const {showActionSheetWithOptions} = useActionSheet();

  const openActionSheet = () => {
    const options = [
      i18next.t("loginMethod.Manual Server Setup"),
      i18next.t("loginMethod.Login Using QR Code"),
      i18next.t("loginMethod.Try Casdoor Demo Site"),
      i18next.t("common.cancel"),
    ];
    const cancelButtonIndex = 3;

    showActionSheetWithOptions(
      {
        title: i18next.t("loginMethod.Select Login Method"),
        cancelButtonTintColor: "red",
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        handleSelection(buttonIndex);
      }
    );
  };

  const handleSelection = (buttonIndex) => {
    switch (buttonIndex) {
    case 0:
      onSelectMethod("manual");
      break;
    case 1:
      onSelectMethod("scan");
      break;
    case 2:
      onSelectMethod("demo");
      break;
    default:
      // Cancel was pressed
      break;
    }
  };

  return {openActionSheet};
};

export default LoginMethodSelector;
