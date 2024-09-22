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
import {View} from "react-native";
import {Searchbar} from "react-native-paper";

const SearchBar = ({onSearch}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const onChangeSearch = (query) => {
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={styles.inputStyle}
      />
    </View>
  );
};

const styles = {
  container: {
    alignItems: "center",
    paddingTop: 2,
  },
  searchbar: {
    height: 56,
    backgroundColor: "#E6DFF3",
    borderRadius: 99,
    width: "95%",
  },
  inputStyle: {
    minHeight: 0,
    textAlignVertical: "center",
    justifyContent: "center",
    alignItems: "center",
  },
};

export default SearchBar;
