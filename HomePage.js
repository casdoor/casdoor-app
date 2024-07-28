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

import React, {useContext, useEffect, useRef, useState} from "react";
import {Dimensions, FlatList, RefreshControl, Text, TouchableOpacity, View} from "react-native";
import {Divider, IconButton, List, Modal, Portal} from "react-native-paper";
import {GestureHandlerRootView, Swipeable} from "react-native-gesture-handler";
import {CountdownCircleTimer} from "react-native-countdown-circle-timer";

import SearchBar from "./SearchBar";
import EnterAccountDetails from "./EnterAccountDetails";
import ScanQRCode from "./ScanQRCode";
import EditAccountDetails from "./EditAccountDetails";
import AvatarWithFallback from "./AvatarWithFallback";
import Account from "./Account";
import UserContext from "./UserContext";
import CasdoorServerContext from "./CasdoorServerContext";
import useSync, {SYNC_STATUS} from "./useSync";

const {width, height} = Dimensions.get("window");
const REFRESH_INTERVAL = 10000;
const OFFSET_X = width * 0.45;
const OFFSET_Y = height * 0.2;

export default function HomePage() {
  const [isPlusButton, setIsPlusButton] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [showEnterAccountModal, setShowEnterAccountModal] = useState(false);
  const [accountList, setAccountList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(accountList);
  const [showScanner, setShowScanner] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const swipeableRef = useRef(null);
  const isSyncing = useRef(false);

  const {userInfo, token} = useContext(UserContext);
  const {casdoorServer} = useContext(CasdoorServerContext);
  const {syncAccounts, syncSignal, resetSyncSignal, addToSyncData} = useSync(userInfo, token, casdoorServer);

  const handleSync = async() => {
    if (isSyncing.current) {return;}
    isSyncing.current = true;
    try {
      const syncedAccounts = await syncAccounts();
      if (syncedAccounts.success && syncedAccounts.accountList) {
        accountList.forEach(account => account.deleteAccount());
        const newAccountList = syncedAccounts.accountList.map(account => new Account(
          account.accountName,
          account.issuer,
          account.secretKey,
          onUpdate
        ));
        setAccountList(newAccountList);
      }
    } finally {
      isSyncing.current = false;
      setRefreshing(false);
      resetSyncSignal();
    }
  };

  useEffect(() => {
    if ((syncSignal || refreshing) && !isSyncing.current) {
      handleSync();
    }
  }, [syncSignal, refreshing]);

  useEffect(() => {
    const timer = setInterval(handleSync, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [handleSync]);

  const onRefresh = () => {
    setRefreshing(true);
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

  const onUpdate = () => setAccountList(prev => [...prev]);

  const handleAddAccount = (accountData) => {
    const newAccount = new Account(accountData.accountName, accountData.issuer, accountData.secretKey, onUpdate);
    addToSyncData(newAccount, SYNC_STATUS.ADD);
    newAccount.token = newAccount.generateToken();

    setAccountList(prev => [...prev, newAccount]);
    closeEnterAccountModal();
  };

  const handleDeleteAccount = (accountName) => {
    const accountToDelete = accountList.find(account => account.accountName === accountName);
    if (accountToDelete) {
      accountToDelete.deleteAccount();
      addToSyncData(accountToDelete, SYNC_STATUS.DELETE);
    }
    setAccountList(prevList => prevList.filter(account => account.accountName !== accountName));
  };

  const handleEditAccount = (accountName) => {
    closeSwipeableMenu();
    const accountToEdit = accountList.find(account => account.accountName === accountName);
    if (accountToEdit) {
      setPlaceholder(accountToEdit.accountName);
      setShowEditAccountModal(true);
      accountToEdit.setEditingStatus(true);
    }
  };

  const onAccountEdit = (newAccountName) => {
    const accountToEdit = accountList.find(account => account.getEditStatus() === true);
    if (accountToEdit) {
      addToSyncData(accountToEdit, SYNC_STATUS.EDIT, newAccountName);
      accountToEdit.setAccountName(newAccountName);
    }
    setPlaceholder("");
    closeEditAccountModal();
  };

  const closeSwipeableMenu = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilteredData(query.trim() !== ""
      ? accountList.filter(item => item.accountName.toLowerCase().includes(query.toLowerCase()))
      : accountList
    );
  };

  return (
    <View style={{flex: 1}}>
      <SearchBar onSearch={handleSearch} />
      <FlatList
        data={searchQuery.trim() !== "" ? filteredData : accountList}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <GestureHandlerRootView>
            <Swipeable
              ref={swipeableRef}
              renderRightActions={(progress, dragX) => (
                <View style={{flexDirection: "row", alignItems: "center"}}>
                  <TouchableOpacity
                    style={{height: 70, width: 80, backgroundColor: "#E6DFF3", alignItems: "center", justifyContent: "center"}}
                    onPress={handleEditAccount.bind(this, item.accountName)}
                  >
                    <Text>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{height: 70, width: 80, backgroundColor: "#FFC0CB", alignItems: "center", justifyContent: "center"}}
                    onPress={handleDeleteAccount.bind(this, item.accountName)}
                  >
                    <Text>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            >
              <List.Item
                style={{height: 80, alignItems: "center", justifyContent: "center", marginLeft: 10}}
                title={
                  <View>
                    <Text style={{fontSize: 20}}>{item.accountName}</Text>
                    <Text style={{fontSize: 35, width: 180}}>{item.token}</Text>
                  </View>
                }
                left={(props) => (
                  <AvatarWithFallback
                    source={{uri: item.issuer ? `https://cdn.casbin.org/img/social_${item.issuer.toLowerCase()}.png` : "https://cdn.casbin.org/img/social_default.png"}}
                    fallbackSource={{uri: "https://cdn.casbin.org/img/social_default.png"}}
                    size={60}
                    style={{marginLeft: 10, marginRight: 10, borderRadius: 10, backgroundColor: "transparent"}}
                  />
                )}
                right={(props) => (
                  <CountdownCircleTimer
                    isPlaying={true}
                    duration={30}
                    initialRemainingTime={item.calculateCountdown()}
                    colors={["#004777", "#0072A0", "#0099CC", "#FF6600", "#CC3300", "#A30000"]}
                    colorsTime={[30, 24, 18, 12, 6, 0]}
                    size={60}
                    onComplete={() => {item.generateAndSetToken(); return {shouldRepeat: true};}}
                    strokeWidth={5}
                  >
                    {({remainingTime}) => (
                      <Text style={{fontSize: 20}}>{remainingTime}s</Text>
                    )}
                  </CountdownCircleTimer>
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
