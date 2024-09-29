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
import {Dimensions, InteractionManager, RefreshControl, TouchableOpacity, View} from "react-native";
import {Divider, IconButton, List, Modal, Portal, Text} from "react-native-paper";
import {GestureHandlerRootView, Swipeable} from "react-native-gesture-handler";
import {CountdownCircleTimer} from "react-native-countdown-circle-timer";
import {useNetInfo} from "@react-native-community/netinfo";
import {FlashList} from "@shopify/flash-list";
import {useNotifications} from "react-native-notificated";

import SearchBar from "./SearchBar";
import EnterAccountDetails from "./EnterAccountDetails";
import ScanQRCode from "./ScanQRCode";
import EditAccountDetails from "./EditAccountDetails";
import AvatarWithFallback from "./AvatarWithFallback";
import {useImportManager} from "./ImportManager";
import useStore from "./useStorage";
import {calculateCountdown} from "./totpUtil";
import {generateToken, validateSecret} from "./totpUtil";
import {useAccountStore, useAccountSync, useEditAccount} from "./useAccountStore";

const {width, height} = Dimensions.get("window");
const REFRESH_INTERVAL = 10000;
const OFFSET_X = width * 0.45;
const OFFSET_Y = height * 0.2;

export default function HomePage() {
  const [isPlusButton, setIsPlusButton] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [showEnterAccountModal, setShowEnterAccountModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(accounts);
  const [showScanner, setShowScanner] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [placeholder, setPlaceholder] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const {isConnected} = useNetInfo();
  const [canSync, setCanSync] = useState(false);
  const [key, setKey] = useState(0);
  const swipeableRef = useRef(null);
  const {userInfo, serverUrl, token} = useStore();
  const {startSync} = useAccountSync();
  const {accounts, refreshAccounts} = useAccountStore();
  const {setAccount, updateAccount, insertAccount, insertAccounts, deleteAccount} = useEditAccount();
  const {notify} = useNotifications();

  const {showImportOptions} = useImportManager((data) => {
    handleAddAccount(data);
  }, (err) => {
    notify("error", {
      params: {title: "Import error", description: err.message},
    });
  }, () => {
    setShowScanner(true);
  });

  useEffect(() => {
    refreshAccounts();
  }, []);

  useEffect(() => {
    setCanSync(Boolean(isConnected && userInfo && serverUrl));
  }, [isConnected, userInfo, serverUrl]);

  useEffect(() => {
    setFilteredData(accounts);
  }, [accounts]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (canSync) {
        InteractionManager.runAfterInteractions(() => {
          startSync(userInfo, serverUrl, token);
          refreshAccounts();
        });
      }
    }, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [startSync, canSync, token]);

  const onRefresh = async() => {
    setRefreshing(true);
    if (canSync) {
      const syncError = await startSync(userInfo, serverUrl, token);
      if (syncError) {
        notify("error", {
          params: {
            title: "Sync error",
            description: syncError,
          },
        });
      } else {
        notify("success", {
          params: {
            title: "Sync success",
            description: "All your accounts are up to date.",
          },
        });
      }
    }
    refreshAccounts();
    setRefreshing(false);
  };

  const handleAddAccount = async(accountDataInput) => {
    if (Array.isArray(accountDataInput)) {
      await insertAccounts(accountDataInput);
    } else {
      await setAccount(accountDataInput);
      await insertAccount();
      closeEnterAccountModal();
    }
    refreshAccounts();
  };

  const handleEditAccount = (account) => {
    closeSwipeableMenu();
    setEditingAccount(account);
    setPlaceholder(account.accountName);
    setShowEditAccountModal(true);
  };

  const onAccountEdit = async(newAccountName) => {
    if (editingAccount) {
      setAccount({...editingAccount, accountName: newAccountName, oldAccountName: editingAccount.accountName});
      updateAccount();
      refreshAccounts();
      setPlaceholder("");
      setEditingAccount(null);
      closeEditAccountModal();
    }
  };

  const onAccountDelete = async(account) => {
    deleteAccount(account.id);
    refreshAccounts();
  };

  const closeEditAccountModal = () => setShowEditAccountModal(false);

  const handleScanPress = () => {
    setShowScanner(true);
    setIsPlusButton(true);
    setShowOptions(false);
  };

  const handleCloseScanner = () => setShowScanner(false);

  const handleScanError = (error) => {
    setShowScanner(false);
    notify("error", {
      params: {
        title: "Error scanning QR code",
        description: error,
      },
    });
  };

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

  const openImportAccountModal = () => {
    showImportOptions();
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
      ? accounts && accounts.filter(item => item.accountName.toLowerCase().includes(query.toLowerCase()))
      : accounts
    );
  };

  return (
    <View style={{flex: 1}}>
      <SearchBar onSearch={handleSearch} />
      <FlashList
        data={searchQuery.trim() !== "" ? filteredData : accounts}
        keyExtractor={(item) => `${item.id}`}
        extraData={key}
        estimatedItemSize={80}
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
                    onPress={() => onAccountDelete(item)}
                  >
                    <Text>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            >
              <List.Item
                style={{
                  height: 80,
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  justifyContent: "center",
                }}
                title={
                  <View style={{justifyContent: "center", paddingLeft: 0, paddingTop: 6}}>
                    <Text variant="titleMedium" numberOfLines={1}>
                      {item.accountName}
                    </Text>
                    <Text variant="titleLarge" style={{fontWeight: "bold"}}>{generateToken(item.secretKey)}</Text>
                  </View>
                }
                left={() => (
                  <AvatarWithFallback
                    source={{uri: `https://cdn.casbin.org/img/social_${item.issuer?.toLowerCase()}.png`}}
                    fallbackSource={{uri: "https://cdn.casbin.org/img/social_default.png"}}
                    size={60}
                    style={{
                      borderRadius: 10,
                      backgroundColor: "transparent",
                    }}
                  />
                )}
                right={() => (
                  <View style={{justifyContent: "center", alignItems: "center"}}>
                    <CountdownCircleTimer
                      key={key}
                      isPlaying={true}
                      duration={30}
                      initialRemainingTime={calculateCountdown()}
                      colors={["#004777", "#0072A0", "#0099CC", "#FF6600", "#CC3300", "#A30000"]}
                      colorsTime={[30, 24, 18, 12, 6, 0]}
                      size={60}
                      onComplete={() => {
                        setKey(prevKey => prevKey + 1);
                        return {
                          shouldRepeat: true,
                          delay: 0,
                          newInitialRemainingTime: calculateCountdown(),
                        };
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
            height: 225,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: [{translateX: -150}, {translateY: -112.5}],
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
          <TouchableOpacity
            style={{flexDirection: "row", alignItems: "center", marginTop: 10}}
            onPress={openImportAccountModal}
          >
            <IconButton icon={"import"} size={35} />
            <Text style={{fontSize: 18}}>Import from other app</Text>
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
          <EnterAccountDetails onClose={closeEnterAccountModal} onAdd={handleAddAccount} validateSecret={validateSecret} />
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
        <ScanQRCode onClose={handleCloseScanner} showScanner={showScanner} onAdd={handleAddAccount} onError={handleScanError} />
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
