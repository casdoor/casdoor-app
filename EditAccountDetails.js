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
import {StyleSheet, Text, TextInput, View} from "react-native";
import {Button, IconButton} from "react-native-paper";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";

export default function EnterAccountDetails({onClose, onEdit, placeholder}) {
  EnterAccountDetails.propTypes = {
    onClose: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
  };

  const {t} = useTranslation();
  const [accountName, setAccountName] = useState(placeholder);

  const handleConfirm = () => {
    onEdit(accountName);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("editAccount.Enter new account name")}</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
            style={styles.closeButton}
          />
        </View>
        <TextInput
          label={t("editAccount.Account Name")}
          placeholder={placeholder}
          value={accountName}
          onChangeText={(text) => setAccountName(text)}
          style={styles.input}
          mode="outlined"
          autoCapitalize="none"
        />
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleConfirm}
            style={styles.addButton}
            labelStyle={styles.buttonLabel}
          >
            {t("common.confirm")}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
  },
  content: {
    width: "100%",
    maxWidth: 500,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    minHeight: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    position: "absolute",
    left: 40,
    right: 40,
    textAlign: "center",
    numberOfLines: 1,
  },
  closeButton: {
    marginLeft: "auto",
    zIndex: 1,
  },
  input: {
    marginVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    height: 50,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: "#8A7DF7",
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  buttonLabel: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
  },
});
