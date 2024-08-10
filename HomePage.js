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

import React, {useEffect, useRef, useState} from "react";
import {Dimensions, RefreshControl, TouchableOpacity, View} from "react-native";
import {Divider, IconButton, List, Modal, Portal, Text} from "react-native-paper";
import {GestureHandlerRootView, Swipeable} from "react-native-gesture-handler";
import {CountdownCircleTimer} from "react-native-countdown-circle-timer";
import {useNetInfo} from "@react-native-community/netinfo";
import {FlashList} from "@shopify/flash-list";
import * as SQLite from "expo-sqlite/next";

import SearchBar from "./SearchBar";
import EnterAccountDetails from "./EnterAccountDetails";
import ScanQRCode from "./ScanQRCode";
import EditAccountDetails from "./EditAccountDetails";
import AvatarWithFallback from "./AvatarWithFallback";
import * as TotpDatabase from "./TotpDatabase";
import useStore from "./useStorage";
import useSyncStore from "./useSyncStore";

const {width, height} = Dimensions.get("window");
const REFRESH_INTERVAL = 10000;
const OFFSET_X = width * 0.45;
const OFFSET_Y = height * 0.2;

export default function HomePage() {
  const [isPlusButton, setIsPlusButton] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [showEnterAccountModal, setShowEnterAccountModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [filteredData, setFilteredData] = useState(accounts);
  const [showScanner, setShowScanner] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [placeholder, setPlaceholder] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const {isConnected} = useNetInfo();
  const [canSync, setCanSync] = useState(false);

  const swipeableRef = useRef(null);
  const {userInfo, serverUrl, token} = useStore();
  const {startSync} = useSyncStore();
  const db = SQLite.useSQLiteContext();

  useEffect(() => {
    if (db) {
      const subscription = SQLite.addDatabaseChangeListener((event) => {loadAccounts();});
      return () => {if (subscription) {subscription.remove();}};
    }
  }, [db]);

  useEffect(() => {
    setCanSync(Boolean(isConnected && userInfo && serverUrl));
  }, [isConnected, userInfo, serverUrl]);

  useEffect(() => {
    setFilteredData(accounts);
  }, [accounts]);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (canSync) {startSync(db, userInfo, serverUrl, token);}
    }, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [startSync]);

  const loadAccounts = async() => {
    const loadedAccounts = await TotpDatabase.getAllAccounts(db);
    setAccounts(loadedAccounts);
    setFilteredData(loadedAccounts);
  };

  const onRefresh = async() => {
    setRefreshing(true);
    if (canSync) {await startSync(db, userInfo, serverUrl, token);}
    setRefreshing(false);
  };

  const handleAddAccount = async(accountData) => {
    await TotpDatabase.insertAccount(db, accountData);
    closeEnterAccountModal();
  };

  const handleDeleteAccount = async(id) => {
    await TotpDatabase.deleteAccount(db, id);
  };

  const handleEditAccount = (account) => {
    closeSwipeableMenu();
    setEditingAccount(account);
    setPlaceholder(account.accountName);
    setShowEditAccountModal(true);
  };

  const onAccountEdit = async(newAccountName) => {
    if (editingAccount) {
      await TotpDatabase.updateAccountName(db, editingAccount.id, newAccountName);
      setPlaceholder("");
      setEditingAccount(null);
      closeEditAccountModal();
    }
  };

  const closeEditAccountModal = () => setShowEditAccountModal(false);

  const handleScanPress = () => {
    setShowScanner(true);
    setIsPlusButton(true);
    setShowOptions(false);
  };

  const handleCloseScanner = () => setShowScanner(false);

  const togglePlusButton = () => {
    setIsPlusButton(!isPlusButton);
    setShowOptions(!showOptions);
  };

  const closeOptions = () => {
    setIsPlusButton(true);
    setShowOptions(false);
    setShowScanner(false);
  };

  const openEnterAccountModal = () => {
    setShowEnterAccountModal(true);
    closeOptions();
  };

  const closeEnterAccountModal = () => setShowEnterAccountModal(false);

  const closeSwipeableMenu = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilteredData(query.trim() !== ""
      ? accounts.filter(item => item.accountName.toLowerCase().includes(query.toLowerCase()))
      : accounts
    );
  };

  return (
    <View style={{flex: 1}}>
      <SearchBar onSearch={handleSearch} />
      <FlashList
        data={searchQuery.trim() !== "" ? filteredData : accounts}
        keyExtractor={(item) => `${item.id}`}
        estimatedItemSize={10}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <GestureHandlerRootView>
            <Swipeable
              ref={swipeableRef}
              renderRightActions={() => (
                <View style={{flexDirection: "row", alignItems: "center"}}>
                  <TouchableOpacity
                    style={{height: 70, width: 80, backgroundColor: "#E6DFF3", alignItems: "center", justifyContent: "center"}}
                    onPress={() => handleEditAccount(item)}
                  >
                    <Text>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{height: 70, width: 80, backgroundColor: "#FFC0CB", alignItems: "center", justifyContent: "center"}}
                    onPress={() => handleDeleteAccount(item.id)}
                  >
                    <Text>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            >
              <List.Item
                style={{
                  height: 80,
                  paddingVertical: 5,
                  paddingHorizontal: 25,
                }}
                title={
                  <View style={{flex: 1, justifyContent: "center"}}>
                    <Text variant="titleMedium">{item.accountName}</Text>
                    <Text variant="headlineSmall" style={{fontWeight: "bold"}}>{item.token}</Text>
                  </View>
                }
                left={() => (
                  <AvatarWithFallback
                    source={{uri: item.issuer ? `https://cdn.casbin.org/img/social_${item.issuer.toLowerCase()}.png` : "https://cdn.casbin.org/img/social_default.png"}}
                    fallbackSource={{uri: "https://cdn.casbin.org/img/social_default.png"}}
                    size={60}
                    style={{
                      marginRight: 15,
                      borderRadius: 10,
                      backgroundColor: "transparent",
                    }}
                  />
                )}
                right={() => (
                  <View style={{justifyContent: "center", alignItems: "center"}}>
                    <CountdownCircleTimer
                      isPlaying={true}
                      duration={30}
                      initialRemainingTime={TotpDatabase.calculateCountdown()}
                      colors={["#004777", "#0072A0", "#0099CC", "#FF6600", "#CC3300", "#A30000"]}
                      colorsTime={[30, 24, 18, 12, 6, 0]}
                      size={60}
                      onComplete={() => {
                        TotpDatabase.updateToken(db, item.id);
                        return {shouldRepeat: true, delay: 0};
                      }}
                      strokeWidth={5}
                    >
                      {({remainingTime}) => (
                        <Text style={{fontSize: 18, fontWeight: "bold"}}>{remainingTime}s</Text>
                      )}
                    </CountdownCircleTimer>
                  </View>
                )}
              />
            </Swipeable>
          </GestureHandlerRootView>
        )}
        ItemSeparatorComponent={() => <Divider />}
      />

      <Portal>
        <Modal
          visible={showOptions}
          onDismiss={closeOptions}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            width: 300,
            height: 150,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: [{translateX: -150}, {translateY: -75}],
          }}
        >
          <TouchableOpacity
            style={{flexDirection: "row", alignItems: "center"}}
            onPress={handleScanPress}
          >
            <IconButton icon={"camera"} size={35} />
            <Text style={{fontSize: 18}}>Scan QR code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: "row", alignItems: "center", marginTop: 10}}
            onPress={openEnterAccountModal}
          >
            <IconButton icon={"keyboard"} size={35} />
            <Text style={{fontSize: 18}}>Enter Secret code</Text>
          </TouchableOpacity>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={showEnterAccountModal}
          onDismiss={closeEnterAccountModal}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 1,
            borderRadius: 10,
            width: "90%",
            height: "40%",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: [{translateX: -OFFSET_X}, {translateY: -OFFSET_Y}],
          }}
        >
          <EnterAccountDetails onClose={closeEnterAccountModal} onAdd={handleAddAccount} />
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={showEditAccountModal}
          onDismiss={closeEditAccountModal}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 1,
            borderRadius: 10,
            width: "90%",
            height: "30%",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: [{translateX: -OFFSET_X}, {translateY: -OFFSET_Y}],
          }}
        >
          <EditAccountDetails onClose={closeEditAccountModal} onEdit={onAccountEdit} placeholder={placeholder} />
        </Modal>
      </Portal>

      {showScanner && (
        <ScanQRCode onClose={handleCloseScanner} showScanner={showScanner} onAdd={handleAddAccount} />
      )}

      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 30,
          right: 30,
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: "#E6DFF3",
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={togglePlusButton}
      >
        <IconButton icon={isPlusButton ? "plus" : "close"} size={40} color={"white"} />
      </TouchableOpacity>
    </View>
  );
}
