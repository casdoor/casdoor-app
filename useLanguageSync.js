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

import {useEffect} from "react";
import {useTranslation} from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useStore from "./useStorage";
import {languages} from "./Language";

export const useLanguageSync = () => {
  const {i18n} = useTranslation();
  const {userInfo} = useStore();

  useEffect(() => {
    const syncLanguage = async() => {
      if (!userInfo?.region) {
        return;
      }

      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage) {
        return; // user manually set language which has higher priority
      }

      // Find matching language based on region code
      const matchedLanguage = languages.find(lang => lang.country === userInfo.region);
      const languageCode = matchedLanguage?.key || "en"; // fallback to English if no match

      if (i18n.language !== languageCode) {
        await i18n.changeLanguage(languageCode);
        await AsyncStorage.setItem("language", languageCode);
      }
    };

    syncLanguage();
  }, [userInfo, i18n]);
};
