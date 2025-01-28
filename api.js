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

import i18next from "i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TIMEOUT_MS = 5000;

const timeout = (ms) => {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), ms));
};

const fetchWithTimeout = async(url, options = {}, timeoutMs = TIMEOUT_MS) => {
  const controller = new AbortController();
  const {signal} = controller;

  try {
    // default headers
    const defaultHeaders = {
      "Accept-Language": await AsyncStorage.getItem("language"),
      "Content-Type": "application/json",
    };

    const {token, ...fetchOptions} = options;

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const finalOptions = {
      ...fetchOptions,
      headers: {
        ...defaultHeaders,
        ...fetchOptions.headers,
      },
      signal,
    };

    const result = await Promise.race([
      fetch(url, finalOptions),
      timeout(timeoutMs),
    ]);

    const res = await result.json();

    if (res.status === "error") {
      throw new Error(res.msg);
    }

    return res;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(i18next.t("api.Request timed out"));
    }
    throw error;
  } finally {
    controller.abort();
  }
};

export const getMfaAccounts = async(serverUrl, owner, name, token, timeoutMs = TIMEOUT_MS) => {
  const res = await fetchWithTimeout(
    `${serverUrl}/api/get-user?id=${owner}/${encodeURIComponent(name)}`,
    {
      method: "GET",
      token,
    },
    timeoutMs
  );

  return {
    updatedTime: res.data.updatedTime,
    mfaAccounts: res.data.mfaAccounts || [],
  };
};

export const updateMfaAccounts = async(serverUrl, owner, name, newMfaAccounts, token, timeoutMs = TIMEOUT_MS) => {
  const userData = await fetchWithTimeout(
    `${serverUrl}/api/get-user?id=${owner}/${encodeURIComponent(name)}`,
    {
      method: "GET",
      token,
    },
    timeoutMs
  );

  userData.data.mfaAccounts = newMfaAccounts;

  const res = await fetchWithTimeout(
    `${serverUrl}/api/update-user?id=${owner}/${encodeURIComponent(name)}`,
    {
      method: "POST",
      token,
      body: JSON.stringify(userData.data),
    },
    timeoutMs
  );

  return {status: res.status, data: res.data};
};

export const validateToken = async(serverUrl, token, timeoutMs = TIMEOUT_MS) => {
  const res = await fetchWithTimeout(
    `${serverUrl}/api/userinfo`,
    {
      method: "GET",
      token,
    },
    timeoutMs
  );

  return !!(res.sub && res.name && res.preferred_username);
};
