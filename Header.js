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
import {Appbar, Avatar, Text} from "react-native-paper";

const Header = () => (
  <Appbar.Header style={{height: 40}}>
    <Appbar.Content title="Casdoor" />
    <Avatar.Image size={32} source={{uri: "https://cdn.casbin.org/img/social_casdoor.png"}} style={{marginRight: 10, backgroundColor: "transparent"}} />
    <Text style={{marginRight: 10}} variant="titleMedium">Admin</Text>
  </Appbar.Header>
);

export default Header;
