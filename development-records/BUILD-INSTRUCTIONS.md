# Sleepless App - Build Instructions

**Project:** Sleepless Event Discovery Platform  
**Version:** 1.0.0  
**Generated:** January 5, 2025

---

## Overview

This document provides comprehensive instructions for building production-ready Android APK and iOS IPA files for the Sleepless mobile application. These build files are required for distribution through the Google Play Store and Apple App Store.

---

## Prerequisites

Before building the app, ensure you have the following:

### Required Accounts
- **Expo Account** - Sign up at https://expo.dev
- **Apple Developer Account** - Required for iOS builds ($99/year)
- **Google Play Developer Account** - Required for Android builds ($25 one-time fee)

### Required Software
- **Node.js** 18+ installed
- **EAS CLI** - Install with `npm install -g eas-cli`
- **Git** - For version control

---

## Method 1: Build via Manus Platform (Recommended)

The easiest way to generate production builds is through the Manus platform's built-in publishing feature.

### Steps:

1. **Create a Checkpoint**
   - Ensure all changes are saved
   - Click "Save Checkpoint" in the Management UI
   - Wait for checkpoint creation to complete

2. **Click the Publish Button**
   - Located in the top-right corner of the Management UI
   - Only enabled after creating a checkpoint

3. **Configure Build Settings**
   - Select platforms: Android, iOS, or both
   - Choose build type: Production or Development
   - Review app configuration (name, version, bundle ID)

4. **Start Build Process**
   - Click "Start Build"
   - Builds are processed in the cloud
   - Receive email notification when complete

5. **Download Build Files**
   - Android: `.aab` (Android App Bundle) for Play Store
   - iOS: `.ipa` file for App Store Connect
   - Download links provided in the Manus UI

### Build Times:
- Android: 10-15 minutes
- iOS: 15-25 minutes

---

## Method 2: Build via Expo EAS (Manual)

If you prefer to build manually using Expo Application Services (EAS), follow these steps.

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Log in to Expo

```bash
eas login
```

Enter your Expo account credentials.

### Step 3: Configure EAS Build

Navigate to your project directory:

```bash
cd /home/ubuntu/sleepless-app
```

Initialize EAS configuration:

```bash
eas build:configure
```

This creates an `eas.json` file with build profiles.

### Step 4: Build for Android

To build an Android App Bundle (AAB) for Google Play:

```bash
eas build --platform android --profile production
```

To build an APK for direct installation (testing):

```bash
eas build --platform android --profile preview
```

### Step 5: Build for iOS

To build an iOS IPA for App Store:

```bash
eas build --platform ios --profile production
```

**Note:** iOS builds require an Apple Developer account. EAS will prompt you to:
- Log in to your Apple account
- Generate necessary certificates and provisioning profiles
- Register your app's bundle ID

### Step 6: Download Build Files

After the build completes (10-25 minutes), EAS will provide a download link. You can also view all builds at:

```bash
eas build:list
```

Download the build files:

```bash
eas build:download --platform android --latest
eas build:download --platform ios --latest
```

---

## Build Configuration

### Android Build Configuration

The Android build is configured in `app.config.ts`:

```typescript
android: {
  adaptiveIcon: {
    backgroundColor: "#E6F4FE",
    foregroundImage: "./assets/images/android-icon-foreground.png",
  },
  package: "space.manus.sleepless.app.t20250105",
  permissions: ["POST_NOTIFICATIONS"],
}
```

**Key Settings:**
- **Package Name**: `space.manus.sleepless.app.t20250105`
- **Version Code**: Auto-incremented by EAS
- **Min SDK Version**: 23 (Android 6.0)
- **Target SDK Version**: 34 (Android 14)

### iOS Build Configuration

The iOS build is configured in `app.config.ts`:

```typescript
ios: {
  supportsTablet: true,
  bundleIdentifier: "space.manus.sleepless.app.t20250105",
}
```

**Key Settings:**
- **Bundle ID**: `space.manus.sleepless.app.t20250105`
- **Version**: 1.0.0
- **Build Number**: Auto-incremented by EAS
- **Deployment Target**: iOS 13.4+

---

## Submitting to App Stores

### Google Play Store Submission

1. **Create a Google Play Console Account**
   - Visit https://play.google.com/console
   - Pay the $25 one-time registration fee

2. **Create a New App**
   - Click "Create app"
   - Enter app details (name, language, type)

3. **Upload the AAB File**
   - Go to "Production" → "Create new release"
   - Upload the `.aab` file downloaded from EAS
   - Add release notes

4. **Complete Store Listing**
   - App description (see pitch deck for copy)
   - Screenshots (5-8 screenshots required)
   - Feature graphic (1024 x 500 px)
   - App icon (512 x 512 px)
   - Privacy policy URL: https://sleepless.co.za/privacy

5. **Content Rating**
   - Complete the content rating questionnaire
   - Select appropriate age ratings

6. **Pricing & Distribution**
   - Set app as Free or Paid
   - Select countries for distribution
   - Accept terms and conditions

7. **Submit for Review**
   - Click "Submit for review"
   - Review typically takes 1-3 days

### Apple App Store Submission

1. **Create an App Store Connect Account**
   - Visit https://appstoreconnect.apple.com
   - Requires Apple Developer Program membership ($99/year)

2. **Register Your App**
   - Click "My Apps" → "+"
   - Enter app name, bundle ID, SKU

3. **Upload the IPA File**
   - Use Transporter app (macOS) or `eas submit` command:
     ```bash
     eas submit --platform ios
     ```

4. **Complete App Information**
   - App description (see pitch deck for copy)
   - Keywords for search optimization
   - Support URL and privacy policy URL
   - App category: Lifestyle or Entertainment

5. **Add Screenshots**
   - 6.5" iPhone (1284 x 2778 px) - 3-10 screenshots
   - 5.5" iPhone (1242 x 2208 px) - 3-10 screenshots
   - iPad Pro (2048 x 2732 px) - 3-10 screenshots

6. **App Review Information**
   - Contact information
   - Demo account credentials (if login required)
   - Notes for reviewer

7. **Submit for Review**
   - Click "Submit for Review"
   - Review typically takes 1-3 days

---

## Testing Build Files

### Testing Android APK

1. **Enable Developer Mode** on your Android device
2. **Transfer APK** to your device via USB or cloud storage
3. **Install APK** by tapping the file
4. **Allow installation** from unknown sources if prompted

### Testing iOS IPA

iOS IPA files cannot be installed directly. Use one of these methods:

**Option 1: TestFlight (Recommended)**
1. Upload IPA to App Store Connect
2. Add internal testers via email
3. Testers install TestFlight app and accept invitation
4. App appears in TestFlight for testing

**Option 2: Ad Hoc Distribution**
1. Register device UDIDs in Apple Developer Portal
2. Build with ad hoc provisioning profile
3. Install via Xcode or Apple Configurator

---

## Troubleshooting

### Common Android Build Issues

**Issue:** Build fails with "Duplicate resources"  
**Solution:** Run `npx expo prebuild --clean` and rebuild

**Issue:** "Package name already exists"  
**Solution:** Change package name in `app.config.ts`

**Issue:** Build succeeds but app crashes on launch  
**Solution:** Check for missing permissions in `app.config.ts`

### Common iOS Build Issues

**Issue:** "No valid code signing identity found"  
**Solution:** Log in to Apple account via `eas build` and regenerate certificates

**Issue:** "Bundle ID is not available"  
**Solution:** Choose a different bundle ID in `app.config.ts`

**Issue:** Build succeeds but app doesn't open  
**Solution:** Check provisioning profile matches the bundle ID

---

## Build Artifacts

After successful builds, you will have the following files:

### Android
- **Production**: `sleepless-app-v1.0.0.aab` (Android App Bundle for Play Store)
- **Preview**: `sleepless-app-v1.0.0.apk` (APK for direct installation)

### iOS
- **Production**: `sleepless-app-v1.0.0.ipa` (IPA for App Store)
- **Development**: `sleepless-app-dev.ipa` (IPA for TestFlight testing)

---

## Next Steps After Building

1. **Test thoroughly** on real devices before submitting to stores
2. **Prepare store assets** (screenshots, descriptions, promotional graphics)
3. **Set up app analytics** (Firebase, Mixpanel) to track user behavior
4. **Configure crash reporting** (Sentry, Crashlytics) for production monitoring
5. **Plan update strategy** for future releases and bug fixes

---

## Additional Resources

- **Expo EAS Build Documentation**: https://docs.expo.dev/build/introduction/
- **Google Play Console Help**: https://support.google.com/googleplay/android-developer
- **App Store Connect Help**: https://developer.apple.com/app-store-connect/
- **Sleepless Deployment Guide**: See `DEPLOYMENT-GUIDE.md` in project root

---

## Support

For build-related issues or questions, contact:

**Sleepless Development Team**  
Email: [dev@sleepless.co.za]  
Documentation: [https://docs.sleepless.co.za]

---

**© 2025 [Your Company Name] (Pty) Ltd. All rights reserved.**
