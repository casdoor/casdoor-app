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

import totp from "totp-generator";

class Account {
  constructor(accountName, issuer, secretKey, onUpdate) {
    this.accountName = accountName;
    this.secretKey = secretKey;
    this.onUpdate = onUpdate;
    this.countdowns = 30;
    this.timer = setInterval(this.updateCountdown.bind(this), 1000);
    this.token = this.generateToken();
    this.isEditing = false;
    this.issuer = issuer;
  }

  generateToken() {
    if (this.secretKey !== null && this.secretKey !== undefined && this.secretKey !== "") {
      const token = totp(this.secretKey);
      const tokenWithSpace = token.slice(0, 3) + " " + token.slice(3);
      return tokenWithSpace;
    }
  }

  generateAndSetToken() {
    this.token = this.generateToken();
    this.onUpdate();
  }

  updateCountdown() {
    this.countdowns = Math.max(0, this.countdowns - 1);
    if (this.countdowns === 0) {
      this.generateAndSetToken();
      this.countdowns = 30;
    }
    this.onUpdate();
  }

  setAccountName(accountName) {
    this.accountName = accountName;
    this.setEditingStatus(false);
  }

  setEditingStatus(status) {
    this.isEditing = status;
    this.onUpdate();
  }

  getEditStatus() {
    return this.isEditing;
  }

  deleteAccount() {
    clearInterval(this.timer);
    this.onUpdate();
  }
}

export default Account;
