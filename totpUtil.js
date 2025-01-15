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

import totp from "totp-generator";
import {useEffect, useState} from "react";

export function calculateCountdown(period = 30) {
  const now = Date.now() / 1000;
  const currentPeriod = Math.floor(now / period);
  const nextPeriod = (currentPeriod + 1) * period;
  return Math.max(0, Math.round(nextPeriod - now));
}

export function validateSecret(secret) {
  const base32Regex = /^[A-Z2-7]+=*$/i;
  if (!secret || secret.length % 8 !== 0) {
    return false;
  }
  return base32Regex.test(secret);
}

export function generateToken(secret) {
  if (secret !== null && secret !== undefined && secret !== "") {
    try {
      const token = totp(secret);
      const tokenWithSpace = token.slice(0, 3) + " " + token.slice(3);
      return tokenWithSpace;
    } catch (error) {
      return "Secret Invalid";
    }
  } else {
    return "Secret Empty";
  }
}

export function useTokenRefresh(secretKey, period = 30) {
  const [token, setToken] = useState(() => generateToken(secretKey));
  const [timeRemaining, setTimeRemaining] = useState(() => calculateCountdown());

  useEffect(() => {
    let timerRef = null;
    let intervalRef = null;
    let countdownRef = null;

    const updateToken = () => {
      setToken(generateToken(secretKey));
      setTimeRemaining(calculateCountdown(period));
    };

    const scheduleNextUpdate = () => {
      const now = Date.now() / 1000;
      const nextUpdate = Math.ceil(now / period) * period;
      const delay = Math.max(0, (nextUpdate - now) * 1000);

      if (timerRef) {
        clearTimeout(timerRef);
      }
      if (intervalRef) {
        clearInterval(intervalRef);
      }
      if (countdownRef) {
        clearInterval(countdownRef);
      }

      timerRef = setTimeout(() => {
        updateToken();
        intervalRef = setInterval(updateToken, period * 1000);
      }, delay);

      countdownRef = setInterval(() => {
        setTimeRemaining(prev => {
          const remaining = prev - 1;
          return remaining >= 0 ? remaining : period;
        });
      }, 1000);
    };

    updateToken();
    scheduleNextUpdate();

    return () => {
      if (timerRef) {
        clearTimeout(timerRef);
      }
      if (intervalRef) {
        clearInterval(intervalRef);
      }
      if (countdownRef) {
        clearInterval(countdownRef);
      }
    };
  }, [secretKey, period]);

  return {token, timeRemaining};
}
