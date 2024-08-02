# Casdoor Authenticator App

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
- iOS: Download the IPA file. Due to Apple's restrictions, you'll need to use AltStore or other tools for installation. For detailed instructions, please refer to the [AltStore FAQ](https://faq.altstore.io/).

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

### ios build (macOS only)

  ```bash
  APP_NAME="casdoorapp"
  WORKSPACE="$APP_NAME.xcworkspace"
  SCHEME="$APP_NAME"
  ARCHIVE_PATH="build/$APP_NAME.xcarchive"
  BUILD_PATH="build"
  PAYLOAD_PATH="$BUILD_PATH/Payload"
  IPA_NAME="$APP_NAME.ipa"

  # Prepare the environment
  npx expo prebuild --platform ios
  cd ios && rm -f Podfile.lock
  pod install --repo-update

  # Build and archive the app
  xcodebuild -scheme "$SCHEME" -workspace "$WORKSPACE" \
    -configuration Release clean archive -archivePath "$ARCHIVE_PATH" \
    CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO

  # Prepare for IPA creation
  cd .. && mkdir -p "$PAYLOAD_PATH"
  mv "$ARCHIVE_PATH/Products/Applications/$APP_NAME.app" "$PAYLOAD_PATH/"

  # Create IPA
  cd "$BUILD_PATH" && zip -r "$IPA_NAME" Payload/
  ```

  The IPA file will be generated in the `build` directory.

Note: You'll need to have the necessary development environments set up for React Native, Android, and iOS. Refer to the React Native documentation for detailed setup instructions.

## Usage

- Open the app on your mobile device.
- Scan QR codes to add accounts and generate TOTP codes for login.
- Log in to your accounts for synchronization with Casdoor.

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](./LICENSE) file for details.
