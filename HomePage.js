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
import {Avatar, List} from "react-native-paper";
import SearchBar from "./SearchBar";

export default function HomePage() {
  return (
    <div>
      <SearchBar />
      <List.Item
        title="Casdoor"
        description="admin"
        left={props => <Avatar.Image size={24} style={{marginLeft: '20px', backgroundColor: 'rgb(242,242,242)'}} source={'https://cdn.casbin.org/img/social_casdoor.png'} />}
      />
      <List.Item
        title="GitHub"
        description="Linus"
        left={props => <Avatar.Image size={24} style={{marginLeft: '20px', backgroundColor: 'rgb(242,242,242)'}} source={'https://cdn.casbin.org/img/social_github.png'} />}
      />
      <List.Item
        title="Google"
        description="James Greenson"
        left={props => <Avatar.Image size={24} style={{marginLeft: '20px', backgroundColor: 'rgb(242,242,242)'}} source={'https://cdn.casbin.org/img/social_google.png'} />}
      />
      <List.Item
        title="Casdoor"
        description="admin"
        left={props => <Avatar.Image size={24} style={{marginLeft: '20px', backgroundColor: 'rgb(242,242,242)'}} source={'https://cdn.casbin.org/img/social_casdoor.png'} />}
      />
      <List.Item
        title="GitHub"
        description="Linus"
        left={props => <Avatar.Image size={24} style={{marginLeft: '20px', backgroundColor: 'rgb(242,242,242)'}} source={'https://cdn.casbin.org/img/social_github.png'} />}
      />
      <List.Item
        title="Google"
        description="James Greenson"
        left={props => <Avatar.Image size={24} style={{marginLeft: '20px', backgroundColor: 'rgb(242,242,242)'}} source={'https://cdn.casbin.org/img/social_google.png'} />}
      />
      <List.Item
        title="Casdoor"
        description="admin"
        left={props => <Avatar.Image size={24} style={{marginLeft: '20px', backgroundColor: 'rgb(242,242,242)'}} source={'https://cdn.casbin.org/img/social_casdoor.png'} />}
      />
      <List.Item
        title="GitHub"
        description="Linus"
        left={props => <Avatar.Image size={24} style={{marginLeft: '20px', backgroundColor: 'rgb(242,242,242)'}} source={'https://cdn.casbin.org/img/social_github.png'} />}
      />
      <List.Item
        title="Google"
        description="James Greenson"
        left={props => <Avatar.Image size={24} style={{marginLeft: '20px', backgroundColor: 'rgb(242,242,242)'}} source={'https://cdn.casbin.org/img/social_google.png'} />}
      />
      <List.Item
        title="Casdoor"
        description="admin"
        left={props => <Avatar.Image size={24} style={{marginLeft: '20px', backgroundColor: 'rgb(242,242,242)'}} source={'https://cdn.casbin.org/img/social_casdoor.png'} />}
      />
      <List.Item
        title="GitHub"
        description="Linus"
        left={props => <Avatar.Image size={24} style={{marginLeft: '20px', backgroundColor: 'rgb(242,242,242)'}} source={'https://cdn.casbin.org/img/social_github.png'} />}
      />
      <List.Item
        title="Google"
        description="James Greenson"
        left={props => <Avatar.Image size={24} style={{marginLeft: '20px', backgroundColor: 'rgb(242,242,242)'}} source={'https://cdn.casbin.org/img/social_google.png'} />}
      />
    </div>
  );
}
