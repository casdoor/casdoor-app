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

import React, {useState} from "react";
import {Modal, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {SvgUri} from "react-native-svg";
import {Text} from "react-native-paper";
import {useTranslation} from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en/data.json";
import zh from "./locales/zh/data.json";
import ja from "./locales/ja/data.json";
import fr from "./locales/fr/data.json";
import de from "./locales/de/data.json";
import ko from "./locales/ko/data.json";
import ar from "./locales/ar/data.json";
import es from "./locales/es/data.json";
import ru from "./locales/ru/data.json";
import pt from "./locales/pt/data.json";
import th from "./locales/th/data.json";
import uk from "./locales/uk/data.json";

const StaticBaseUrl = "https://cdn.casbin.org";

const languageResources = {en, zh, ja, fr, de, ko, ar, es, ru, pt, th, uk};

export const languages = [
  {label: "English", key: "en", country: "US", alt: "English"},
  {label: "Español", key: "es", country: "ES", alt: "Spanish"},
  {label: "Français", key: "fr", country: "FR", alt: "French"},
  {label: "Deutsch", key: "de", country: "DE", alt: "German"},
  {label: "中文", key: "zh", country: "CN", alt: "中文"},
  {label: "日本語", key: "ja", country: "JP", alt: "Japanese"},
  {label: "한국어", key: "ko", country: "KR", alt: "Korean"},
  {label: "Русский", key: "ru", country: "RU", alt: "Russian"},
  {label: "Português", key: "pt", country: "PT", alt: "Portuguese"},
  {label: "العربية", key: "ar", country: "SA", alt: "Arabic"},
  {label: "Українська", key: "uk", country: "UA", alt: "Ukrainian"},
  {label: "Thai", key: "th", country: "TH", alt: "Thai"},
];

const rtlLanguages = ["ar"];

export const isRTL = languageKey => {
  return rtlLanguages.includes(languageKey);
};

export const getLanguageResources = () => {
  const resources = {};
  languages.forEach(({key}) => {
    resources[key] = {
      translation: languageResources[key],
    };
  });
  return resources;
};

function flagIcon(country, alt) {
  return (
    <SvgUri
      uri={`${StaticBaseUrl}/flag-icons/${country}.svg`}
      style={styles.flagIcon}
      accessibilityLabel={alt}
    />
  );
}

export function Language() {
  const {i18n, t} = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const currentLanguage = i18n.language;
  const currentLangDetails = languages.find(lang => lang.key === currentLanguage) || languages[0];
  const isRTLLanguage = isRTL(currentLanguage);

  const handleLanguageChange = async key => {
    i18n.changeLanguage(key);
    await AsyncStorage.setItem("language", key);
    setIsOpen(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.dropdownTrigger,
          isRTLLanguage && styles.dropdownTriggerRTL,
        ]}
        onPress={() => setIsOpen(true)}
      >
        {flagIcon(currentLangDetails.country, currentLangDetails.alt)}
        <Text style={[
          styles.dropdownIcon,
          isRTLLanguage && styles.dropdownIconRTL,
        ]}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdownMenu}>
            <Text style={styles.title}>{t("settings.Language")}</Text>
            <ScrollView>
              {languages.map(({key, country, alt, label}) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => {handleLanguageChange(key);}}
                  style={[
                    styles.languageButton,
                    isRTLLanguage && styles.languageButtonRTL,
                    currentLanguage === key && styles.activeButton,
                  ]}
                >
                  {flagIcon(country, alt)}
                  <Text
                    style={[
                      styles.languageLabel,
                      isRTLLanguage && styles.languageLabelRTL,
                      currentLanguage === key && styles.activeLabel,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  dropdownTriggerRTL: {
    flexDirection: "row-reverse",
  },
  selectedLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#666",
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  dropdownMenu: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  languageButtonRTL: {
    flexDirection: "row-reverse",
  },
  activeButton: {
    backgroundColor: "#e7f3ff",
    borderColor: "#2196f3",
  },
  languageLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    fontWeight: "500",
  },
  languageLabelRTL: {
    marginLeft: 0,
    marginRight: 12,
  },
  activeLabel: {
    color: "#2196f3",
    fontWeight: "600",
  },
  flagIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    borderRadius: 4,
  },
});
