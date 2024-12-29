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

import {integer, sqliteTable, text, unique} from "drizzle-orm/sqlite-core";
import {sql} from "drizzle-orm";

export const accounts = sqliteTable("accounts", {
  id: integer("id", {mode: "number"}).primaryKey({autoIncrement: true}),
  accountName: text("account_name").notNull(),
  oldAccountName: text("old_account_name").default(null),
  secretKey: text("secret").notNull(),
  issuer: text("issuer").default(null),
  token: text("token"),
  deletedAt: integer("deleted_at", {mode: "timestamp_ms"}).default(null),
  changedAt: integer("changed_at", {mode: "timestamp_ms"}).default(sql`(CURRENT_TIMESTAMP)`),
  syncAt: integer("sync_at", {mode: "timestamp_ms"}).default(null),
  origin: text("origin").default(null),
}, (accounts) => ({
  unq: unique().on(accounts.accountName, accounts.issuer),
})
);
