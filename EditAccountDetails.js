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
import {Text, TextInput, View} from "react-native";
import {Button, IconButton} from "react-native-paper";
import PropTypes from "prop-types";

export default function EnterAccountDetails({onClose, onEdit, placeholder}) {
  EnterAccountDetails.propTypes = {
    onClose: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
  };

  const [description, setDescription] = useState("");

  const handleConfirm = () => {
    onEdit(description);
  };
  return (
    <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
      <Text style={{fontSize: 24, marginBottom: 5}}>Enter new description</Text>
      <View style={{flexDirection: "row", alignItems: "center"}}>
        <IconButton icon="account-details" size={35} />
        <TextInput
          placeholder={placeholder}
          value={description}
          onChangeText={(text) => setDescription(text)}
          style={{borderWidth: 3, borderColor: "white", margin: 10, width: 230, height: 50, borderRadius: 5, fontSize: 18, color: "gray", paddingLeft: 10}}
        />
      </View>
      <Button
        style={{
          backgroundColor: "#E6DFF3",
          borderRadius: 5,
          margin: 10,
          alignItems: "center",
          position: "absolute",
          top: 160,
          width: 300,
        }}
        onPress={handleConfirm}
      >
        <Text style={{fontSize: 18, width: 280}}>Confirm</Text>
      </Button>
      <IconButton icon={"close"} size={30} onPress={onClose} style={{position: "absolute", top: 5, right: 5}} />
    </View>
  );
}
