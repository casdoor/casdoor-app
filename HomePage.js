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

import * as React from "react";
import {Dimensions, FlatList, Text, TouchableOpacity, View} from "react-native";
import {Avatar, Divider, IconButton, List, Modal, Portal} from "react-native-paper";
import SearchBar from "./SearchBar";
import {GestureHandlerRootView, Swipeable} from "react-native-gesture-handler";

import EnterAccountDetails from "./EnterAccountDetails";
import Account from "./Account";
import ScanQRCode from "./ScanQRCode";
import EditAccountDetails from "./EditAccountDetails";

export default function HomePage() {
  const [isPlusButton, setIsPlusButton] = React.useState(true);
  const [showOptions, setShowOptions] = React.useState(false);
  const [showEnterAccountModal, setShowEnterAccountModal] = React.useState(false);
  const [accountList, setAccountList] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredData, setFilteredData] = React.useState(accountList);
  const [showScanner, setShowScanner] = React.useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = React.useState(false);
  const swipeableRef = React.useRef(null);
  const [placeholder, setPlaceholder] = React.useState("");
  const closeEditAccountModal = () => {
    setShowEditAccountModal(false);
  };
  const handleScanPress = () => {
    setShowScanner(true);
    setIsPlusButton(true);
    setShowOptions(false);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
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

  const closeEnterAccountModal = () => {
    setShowEnterAccountModal(false);
  };

  const onUpdate = () => {
    setAccountList(prevList => [...prevList]);
  };
  const handleAddAccount = (accountData) => {
    const newAccount = new Account(accountData.description, accountData.secretCode, onUpdate, accountData.icon);
    const token = newAccount.generateToken();
    newAccount.token = token;

    setAccountList(prevList => [...prevList, newAccount]);
    closeEnterAccountModal();
  };

  const handleDeleteAccount = (accountDescp) => {
    const accountToDelete = accountList.find(account => {
      return account.getTitle() === accountDescp;
    });
    if (accountToDelete) {
      accountToDelete.deleteAccount();
    }
    setAccountList(prevList => prevList.filter(account => account.getTitle() !== accountDescp));
  };
  const handleEditAccount = (accountDescp) => {
    closeSwipeableMenu();
    setPlaceholder(accountDescp);
    setShowEditAccountModal(true);
    const accountToEdit = accountList.find(account => account.getTitle() === accountDescp);

    if (accountToEdit) {
      accountToEdit.setEditingStatus(true);
    }
  };

  const onAccountEdit = (accountDescp) => {
    const accountToEdit = accountList.find(account => account.getEditStatus() === true);
    if (accountToEdit) {
      accountToEdit.setTitle(accountDescp);
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

    if (query.trim() !== "") {
      const filteredResults = accountList.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filteredResults);
    } else {
      setFilteredData(accountList);
    }
  };

  const {width, height} = Dimensions.get("window");

  const offsetX = width * 0.45;
  const offsetY = height * 0.2;

  return (
    <View style={{flex: 1}}>
      <SearchBar onSearch={handleSearch} />
      <FlatList
        data={searchQuery.trim() !== "" ? filteredData : accountList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <GestureHandlerRootView>
            <Swipeable
              ref={swipeableRef}
              renderRightActions={(progress, dragX) => (
                <View style={{flexDirection: "row", alignItems: "center"}}>
                  <TouchableOpacity
                    style={{height: 70, width: 80, backgroundColor: "#E6DFF3", alignItems: "center", justifyContent: "center"}}
                    onPress={handleEditAccount.bind(this, item.title)}
                  >
                    <Text>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{height: 70, width: 80, backgroundColor: "#FFC0CB", alignItems: "center", justifyContent: "center"}}
                    onPress={handleDeleteAccount.bind(this, item.title)}
                  >
                    <Text>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            >
              <List.Item
                style={{height: 80, alignItems: "center", justifyContent: "center"}}
                title={
                  <View>
                    <Text style={{fontSize: 20}}>{item.title}</Text>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                      <Text style={{fontSize: 35, width: 180}}>{item.token}</Text>
                      <Text style={{fontSize: 20, width: 40}}>{item.countdowns}s</Text>
                    </View>
                  </View>
                }
                left={(props) => (
                  item.icon ?
                    <Avatar.Image size={60} source={{uri: item.icon}} style={{marginLeft: 20, marginRight: 20, borderRadius: 10, backgroundColor: "transparent"}} />
                    : <Avatar.Icon size={80} icon={"account"} color={"black"} style={{marginLeft: 10, marginRight: 10, borderRadius: 10, backgroundColor: "transparent"}} />
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
            <Text style={{fontSize: 18}} >Scan QR code</Text>
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
            transform: [{translateX: -offsetX}, {translateY: -offsetY}],
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
            transform: [{translateX: -offsetX}, {translateY: -offsetY}],
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
