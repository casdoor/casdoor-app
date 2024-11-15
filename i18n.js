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

import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import {getLocales} from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getLanguageResources, isRTL} from "./Language";

const initI18n = async() => {
  let savedLanguage = await AsyncStorage.getItem("language");

  if (!savedLanguage) {
    savedLanguage = getLocales()[0].languageCode;
  }

  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: "v3",
      resources: getLanguageResources(),
      lng: savedLanguage,
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
      direction: isRTL(savedLanguage) ? "rtl" : "ltr",
    });
};

initI18n();

export default i18n;
