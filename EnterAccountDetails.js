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

import React, {useCallback, useState} from "react";
import {View} from "react-native";
import {Button, IconButton, Menu, Text, TextInput} from "react-native-paper";
import {useNotifications} from "react-native-notificated";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";

const EnterAccountDetails = ({onClose, onAdd, validateSecret}) => {
  EnterAccountDetails.propTypes = {
    onClose: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    validateSecret: PropTypes.func.isRequired,
  };

  const {notify} = useNotifications();
  const {t} = useTranslation();
  const [accountName, setAccountName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [secretError, setSecretError] = useState("");
  const [accountNameError, setAccountNameError] = useState("");
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Time based");
  const [showPassword, setShowPassword] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleMenuItemPress = useCallback((item) => {
    setSelectedItem(item);
    closeMenu();
  }, []);

  const handleAddAccount = useCallback(() => {
    if (accountName.trim() === "") {
      setAccountNameError(t("editAccount.Account Name is required"));
    }

    if (secretKey.trim() === "") {
      setSecretError(t("editAccount.Secret Key is required"));
    }

    if (accountName.trim() === "" || secretKey.trim() === "") {
      notify("error", {
        title: t("common.error"),
        description: t("editAccount.Please fill in all the fields!"),
      });
      return;
    }

    if (secretError) {
      notify("error", {
        title: t("common.error"),
        description: t("editAccount.Invalid Secret Key"),
      });
      return;
    }

    onAdd({accountName, secretKey});
    setAccountName("");
    setSecretKey("");
    setAccountNameError("");
    setSecretError("");
  }, [accountName, secretKey, secretError, onAdd]);

  const handleSecretKeyChange = useCallback((text) => {
    setSecretKey(text);
    if (validateSecret) {
      const isValid = validateSecret(text);
      setSecretError(isValid || text.trim() === "" ? "" : "Invalid Secret Key");
    }
  }, [validateSecret]);

  const handleAccountNameChange = useCallback((text) => {
    setAccountName(text);
    if (accountNameError) {
      setAccountNameError("");
    }
  }, [accountNameError]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("editAccount.Add Account")}</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
            style={styles.closeButton}
          />
        </View>
        <TextInput
          label={t("editAccount.Account Name")}
          value={accountName}
          onChangeText={handleAccountNameChange}
          error={!!accountNameError}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label={t("editAccount.Secret Key")}
          value={secretKey}
          onChangeText={handleSecretKeyChange}
          secureTextEntry={!showPassword}
          error={!!secretError}
          style={styles.input}
          mode="outlined"
          right={(props) => (
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword(!showPassword)}
            />
          )}
        />
        <View style={styles.buttonContainer}>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <Button
                onPress={openMenu}
                mode="outlined"
                icon="chevron-down"
                contentStyle={styles.menuButtonContent}
                style={styles.menuButton}
              >
                {t(`editAccount.${selectedItem}`)}
              </Button>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => handleMenuItemPress("Time based")}
              title={t("editAccount.Time based")}
            />
            <Menu.Item
              onPress={() => handleMenuItemPress("Counter based")}
              title={t("editAccount.Counter based")}
            />
          </Menu>
          <Button
            mode="contained"
            onPress={handleAddAccount}
            style={styles.addButton}
            labelStyle={styles.buttonLabel}
          >
            {t("editAccount.Add Account")}
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    borderRadius: 10,
    padding: 20,
    backgroundColor: "#F5F5F5",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    position: "relative",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: -8,
  },
  input: {
    marginVertical: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  menuButton: {
    flex: 1,
    marginRight: 10,
    height: 50,
    justifyContent: "center",
    fontSize: 12,
  },
  menuButtonContent: {
    height: 50,
    justifyContent: "center",
  },
  menuContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
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
};

export default EnterAccountDetails;
