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
import { Button, IconButton } from 'react-native-paper';

export default function EnterAccountDetails({ onClose, onAdd }) {
  const [description, setDescription] = useState('');
  const [secretCode, setSecretCode] = useState('');

  const handleAddAccount = () => {
    onAdd({ description, secretCode });
    setDescription('');
    setSecretCode('');
  };

  return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{fontSize: 24, marginBottom: 5}}>Add new 2FA account</Text>
        <div style={{display: 'flex', marginTop: 10}}>
          <IconButton icon='account-details' size={35}></IconButton>
          <TextInput
              placeholder='Description'
              value={description}
              onChangeText={(text) => setDescription(text)}
              style={{ borderWidth: 3, borderColor: 'white', margin: 10, width: 230, height: 50, borderRadius: 5, fontSize: 18,
                color: 'gray', paddingLeft: 10}}
          />
        </div>
        <div style={{display: 'flex'}}>
          <IconButton icon='account-key' size={35}></IconButton>
          <TextInput
              placeholder='Secret code'
              value={secretCode}
              onChangeText={(text) => setSecretCode(text)}
              secureTextEntry
              style={{ borderWidth: 3, borderColor: 'white', margin: 10, width: 230, height: 50, borderRadius: 5, fontSize: 18,
                color: 'gray', paddingLeft: 10 }}
          />
        </div>
        <Button
            icon='account-plus'
            style={{
              backgroundColor: '#393544',
              borderRadius: 5,
              margin: 10,
              alignItems: 'center',
              position: 'absolute',
              top: 260,
              width: 300,
              // height: 50
            }}
            onPress={handleAddAccount}
        >
          <Text style={{fontSize: 18}}>Add</Text>
        </Button>
        <IconButton icon={'close'} size={30} onPress={onClose} style={{position: 'absolute', top: 5, right: 5}} />
      </View>
  );
}
