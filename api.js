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

const TIMEOUT_MS = 5000;

const timeout = (ms) => {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), ms));
};

export const getMfaAccounts = async(serverUrl, owner, name, token, timeoutMs = TIMEOUT_MS) => {
  const controller = new AbortController();
  const {signal} = controller;

  try {
    const result = await Promise.race([
      fetch(`${serverUrl}/api/get-user?id=${owner}/${encodeURIComponent(name)}&access_token=${token}`, {
        method: "GET",
        signal,
      }),
      timeout(timeoutMs),
    ]);

    const res = await result.json();

    // Check the response status and message
    if (res.status === "error") {
      throw new Error(res.msg);
    }

    return {
      updatedTime: res.data.updatedTime,
      mfaAccounts: res.data.mfaAccounts || [],
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  } finally {
    controller.abort();
  }
};

export const updateMfaAccounts = async(serverUrl, owner, name, newMfaAccounts, token, timeoutMs = TIMEOUT_MS) => {
  const controller = new AbortController();
  const {signal} = controller;

  try {
    const getUserResult = await Promise.race([
      fetch(`${serverUrl}/api/get-user?id=${owner}/${encodeURIComponent(name)}&access_token=${token}`, {
        method: "GET",
        Authorization: `Bearer ${token}`,
        signal,
      }),
      timeout(timeoutMs),
    ]);

    const userData = await getUserResult.json();

    userData.data.mfaAccounts = newMfaAccounts;

    const updateResult = await Promise.race([
      fetch(`${serverUrl}/api/update-user?id=${owner}/${encodeURIComponent(name)}&access_token=${token}`, {
        method: "POST",
        Authorization: `Bearer ${token}`,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData.data),
        signal,
      }),
      timeout(timeoutMs),
    ]);

    const res = await updateResult.json();

    // Check the response status and message
    if (res.status === "error") {
      throw new Error(res.msg);
    }

    return {status: res.status, data: res.data};
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  } finally {
    controller.abort();
  }
};
