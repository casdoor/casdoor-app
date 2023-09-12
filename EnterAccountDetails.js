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

import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import {Button, Divider, IconButton, Menu} from 'react-native-paper';
import PropTypes from "prop-types";

export default function EnterAccountDetails({ onClose, onAdd }) {
  EnterAccountDetails.propTypes = {
    onClose: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
  };

  const [description, setDescription] = useState('');
  const [secretCode, setSecretCode] = useState('');

  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const [selectedItem, setSelectedItem] = useState('Time based');

  const handleMenuItemPress = (item) => {
    setSelectedItem(item);
    closeMenu();
  };

  const handleAddAccount = () => {
    onAdd({ description, secretCode });
    setDescription('');
    setSecretCode('');
  };

  return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{fontSize: 24, marginBottom: 5}}>Add new 2FA account</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon='account-details' size={35} />
          <TextInput
              placeholder='Description'
              value={description}
              onChangeText={(text) => setDescription(text)}
              style={{ borderWidth: 3, borderColor: 'white', margin: 10, width: 230, height: 50, borderRadius: 5, fontSize: 18,
                color: 'gray', paddingLeft: 10}}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon='account-key' size={35} />
          <TextInput
              placeholder='Secret code'
              value={secretCode}
              onChangeText={(text) => setSecretCode(text)}
              secureTextEntry
              style={{ borderWidth: 3, borderColor: 'white', margin: 10, width: 230, height: 50, borderRadius: 5, fontSize: 18,
                color: 'gray', paddingLeft: 10 }}
          />
        </View>
        <Button
            icon='account-plus'
            style={{
              backgroundColor: '#E6DFF3',
              borderRadius: 5,
              margin: 10,
              alignItems: 'center',
              position: 'absolute',
              top: 230,
              right: 30,
              width: 90,
            }}
            onPress={handleAddAccount}
        >
          <Text style={{fontSize: 18}}>Add</Text>
        </Button>
        <IconButton icon={'close'} size={30} onPress={onClose} style={{position: 'absolute', top: 5, right: 5}} />
        <View
            style={{
              backgroundColor: '#E6DFF3',
              borderRadius: 5,
              position: 'absolute',
              left: 30,
              top: 240,
              width: 140,
            }}
        >
          <Menu
              visible={visible}
              onDismiss={closeMenu}
              anchor={
                <Button style={{ alignItems: 'left'}} icon={'chevron-down'} onPress={openMenu}>
                  {selectedItem}
                </Button>
              }
          >
            <Menu.Item onPress={() => handleMenuItemPress('Time based')} title='Time based' />
            <Divider />
            <Menu.Item onPress={() => handleMenuItemPress('Counter based')} title='Counter based' />
          </Menu>
        </View>
      </View>
  );
}
