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

import * as React from 'react';
import { View, TouchableOpacity, Text, FlatList } from 'react-native';
import { Avatar, List, Portal, Modal, IconButton } from 'react-native-paper';
import SearchBar from './SearchBar';

import EnterAccountDetails from './EnterAccountDetails';
import Account from "./Account";

export default function HomePage() {
  const [isPlusButton, setIsPlusButton] = React.useState(true);
  const [showOptions, setShowOptions] = React.useState(false);
  const [showEnterAccountModal, setShowEnterAccountModal] = React.useState(false);
  const [accountList, setAccountList] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredData, setFilteredData] = React.useState(accountList);

  const togglePlusButton = () => {
    setIsPlusButton(!isPlusButton);
    setShowOptions(!showOptions);
  };

  const closeOptions = () => {
    setIsPlusButton(true);
    setShowOptions(false);
  };

  const openEnterAccountModal = () => {
    setShowEnterAccountModal(true);
    closeOptions();
  };

  const closeEnterAccountModal = () => {
    setShowEnterAccountModal(false);
  };

  const handleAddAccount = async (accountData) => {
    const onUpdate = () => {
      setAccountList(prevList => [...prevList]);
    };

    const newAccount = new Account(accountData.description, accountData.secretCode, onUpdate);
    const token = await newAccount.generateToken();
    newAccount.token = token;

    await setAccountList(prevList => [...prevList, newAccount]);
    closeEnterAccountModal();
  };
  React.useEffect(() => {
    setAccountList(prevList => [...prevList]);
  }, [accountList]);


  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() !== '') {
      const filteredResults = accountList.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filteredResults);
    } else {
      setFilteredData(accountList);
    }
  };

  return (
      <View style={{ flex: 1 }}>
        <SearchBar onSearch={ handleSearch } />
        <FlatList
            // data={accountList}
            data={searchQuery.trim() !== '' ? filteredData : accountList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
                <List.Item
                    title={
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, width: 80 }}>{item.title}</Text>
                        <Text style={{ marginLeft: 20, fontSize: 30 }}>{item.token}</Text>
                        <Text style={{ marginLeft: 20, fontSize: 20, width: 20 }}>{item.countdowns}s</Text>
                      </View>
                    }
                    left={(props) => (
                        <Avatar.Image
                            size={60}
                            style={{ marginLeft: '20px', backgroundColor: 'rgb(242,242,242)' }}
                            source={'https://cdn.casbin.org/img/social_casdoor.png'}
                        />
                    )}
                />
            )}
        />

        <Portal>
          <Modal
              visible={showOptions}
              onDismiss={closeOptions}
              contentContainerStyle={{
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 10,
                width: 300,
                height: 150,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
              }}
          >
            <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center'}}
                onPress={() => {
                  // Handle scanning QR code operation...
                  // closeOptions();
                }}
            >
              <IconButton icon={'camera'} size={35} />
              <Text style={{fontSize: 18}} >Scan QR code</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
                onPress={openEnterAccountModal}
            >
              <IconButton icon={'keyboard'} size={35} />
              <Text style={{fontSize: 18}}>Enter Secret code</Text>
            </TouchableOpacity>
          </Modal>
        </Portal>

        <Portal>
          <Modal
              visible={showEnterAccountModal}
              onDismiss={closeEnterAccountModal}
              contentContainerStyle={{
                backgroundColor: 'white',
                padding: 1,
                borderRadius: 10,
                width: '90%',
                height: '40%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
              }}
          >
            <EnterAccountDetails onClose={closeEnterAccountModal} onAdd={handleAddAccount} />
          </Modal>
        </Portal>

        <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 30,
              right: 30,
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: '#393544',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={togglePlusButton}
        >
          <IconButton icon={isPlusButton ? 'plus' : 'close'} size={40} color={'white'} />
        </TouchableOpacity>
      </View>
  );
}
