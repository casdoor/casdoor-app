# Casdoor Authenticator App

[![GitHub Actions](https://github.com/casdoor/casdoor-app/actions/workflows/release.yml/badge.svg)](https://github.com/casdoor/casdoor-app/actions/workflows/release.yml)
[![Release](https://img.shields.io/github/release/casdoor/casdoor-app.svg)](https://github.com/casdoor/casdoor-app/releases/latest)
[![GitHub issues](https://img.shields.io/github/issues/casdoor/casdoor-app?style=flat-square)](https://github.com/casdoor/casdoor-app/issues)
[![GitHub forks](https://img.shields.io/github/forks/casdoor/casdoor-app?style=flat-square)](https://github.com/casdoor/casdoor-app/network)
[![License](https://img.shields.io/github/license/casdoor/casdoor-app?style=flat-square)](https://github.com/casdoor/casdoor-app/blob/master/LICENSE)
[![Discord](https://img.shields.io/discord/1022748306096537660?logo=discord&label=discord&color=5865F2)](https://discord.gg/5rPsrAzK7S)

Casdoor Authenticator App is a mobile application for iOS and Android that provides multi-factor authentication using the TOTP protocol. This app helps secure user accounts by generating time-based one-time passwords (TOTP). The app is developed using the React Native framework.

## Features

- [x] Multi-platform support (iOS/Android)
- [x] TOTP-based multi-factor authentication
- [x] Account synchronization with Casdoor
- [ ] Integration with Casdoor's central service and desktop client

## Quick Start

```bash
git clone git@github.com:casdoor/casdoor-app.git
cd casdoor-app
npm install && npm run start
```

## Installation

You can download the latest version of the Casdoor Authenticator App from the GitHub Releases page.

- Android: Download and install the APK file directly on your device.

### Building from Source

If you prefer to build the app yourself, follow these steps:

### Common Steps

```bash
git clone git@github.com:casdoor/casdoor-app.git
cd casdoor-app
npm install
```

### android build

  ```bash
  npm install && npx expo prebuild --platform android
  cd android && ./gradlew assembleRelease
  ```

  The APK file in the `app/build/outputs/apk/release/` directory.

Note: You'll need to have the necessary development environments set up for React Native, Android. Refer to the React Native documentation for detailed setup instructions.

## Usage

- Open the app on your mobile device.
- Scan QR codes to add accounts and generate TOTP codes for login.
- Log in to your accounts for synchronization with Casdoor.

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](./LICENSE) file for details.
