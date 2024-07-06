// Copyright 2024 The Casdoor Authors. All Rights Reserved.
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
import {View} from "react-native";
import {Image} from "expo-image";

const AvatarWithFallback = ({source, fallbackSource, size, style}) => {
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  return (
    <View style={{overflow: "hidden", borderRadius: 9999, width: size, height: size, ...style}}>
      <Image
        style={{width: "100%", height: "100%"}}
        source={hasError ? fallbackSource : source}
        onError={handleImageError}
        contentFit="cover"
        transition={300}
        cachePolicy={"disk"}
      />
    </View>
  );
};

export default AvatarWithFallback;
