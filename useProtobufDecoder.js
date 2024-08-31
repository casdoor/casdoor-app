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

import {useEffect, useState} from "react";
import {useAssets} from "expo-asset";
import * as FileSystem from "expo-file-system";
import protobuf from "protobufjs";
import {encode as base32Encode} from "hi-base32";
import {Buffer} from "buffer";

const useProtobufDecoder = (protobufAsset) => {
  const [assets] = useAssets([protobufAsset]);
  const [decoder, setDecoder] = useState(null);

  useEffect(() => {
    const initializeDecoder = async() => {
      if (!assets) {return;}

      try {
        // Read the file content
        const fileContent = await FileSystem.readAsStringAsync(assets[0].localUri);

        // Parse the protobuf schema
        const root = protobuf.parse(fileContent).root;
        const MigrationPayload = root.lookupType("google_auth.MigrationPayload");

        // Create the decoder object
        const newDecoder = {
          decodeProtobuf: (payload) => {
            const message = MigrationPayload.decode(payload);
            return MigrationPayload.toObject(message, {
              longs: String,
              enums: String,
              bytes: String,
            });
          },
          decodeData: (data) => {
            const buffer = Buffer.from(decodeURIComponent(data), "base64");
            const payload = newDecoder.decodeProtobuf(buffer);
            return payload.otpParameters.map(account => ({
              accountName: account.name,
              issuer: account.issuer || null,
              totpSecret: base32Encode(Buffer.from(account.secret, "base64")),
            }));
          },
          decodeExportUri: (uri) => {
            const data = new URL(uri).searchParams.get("data");
            if (!data) {
              throw new Error("No data parameter found in the URI");
            }
            return newDecoder.decodeData(data);
          },
        };

        setDecoder(newDecoder);
      } catch (error) {
        throw new Error("Failed to initialize ProtobufDecoder:", error);
      }
    };

    initializeDecoder();
  }, [assets]);

  return decoder;
};

export default useProtobufDecoder;
