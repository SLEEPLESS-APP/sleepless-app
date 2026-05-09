# Sleepless App - Production Deployment Guide

**Version 1.0.0 | December 2024**

---

## Overview

This guide provides complete instructions for deploying the Sleepless mobile application to the Apple App Store and Google Play Store. The app is built with Expo SDK 54 and React Native, supporting iOS, Android, and web platforms.

---

## Prerequisites

Before beginning the deployment process, ensure you have the following accounts and tools ready.

### Required Accounts

| Account | Purpose | Sign-up Link |
|---------|---------|--------------|
| Apple Developer Program | iOS app distribution | https://developer.apple.com/programs/ |
| Google Play Console | Android app distribution | https://play.google.com/console |
| Expo Account | Build and deployment services | https://expo.dev/signup |

### Cost Summary

| Service | Cost | Billing Cycle |
|---------|------|---------------|
| Apple Developer Program | $99 USD | Annual |
| Google Play Console | $25 USD | One-time |
| Expo EAS Build | Free tier available | Per-build after free tier |

---

## App Configuration

The Sleepless app is already configured for production deployment with the following settings.

### App Identity

| Property | Value |
|----------|-------|
| App Name | Sleepless |
| Version | 1.0.0 |
| iOS Bundle ID | space.manus.sleepless.app.t20251229063622 |
| Android Package | space.manus.sleepless.app.t20251229063622 |
| Deep Link Scheme | manus20251229063622 |

### App Icons

All required icons are configured and located in `/assets/images/`:

| Platform | File | Resolution | Purpose |
|----------|------|------------|---------|
| iOS | icon.png | 1024x1024 | App Store icon |
| Android | android-icon-foreground.png | 1024x1024 | Adaptive icon foreground |
| Android | android-icon-background.png | 1024x1024 | Adaptive icon background |
| Android | android-icon-monochrome.png | 1024x1024 | Monochrome icon |
| Web | favicon.png | 1024x1024 | Browser favicon |
| Splash | splash-icon.png | 1024x1024 | Splash screen logo |

### Permissions

The app requests the following permissions:

| Permission | Platform | Purpose |
|------------|----------|---------|
| POST_NOTIFICATIONS | Android | Event reminders and updates |
| Camera (optional) | iOS/Android | Profile photo capture |
| Photo Library (optional) | iOS/Android | Profile photo selection |

---

## Deployment Methods

There are two primary methods for deploying the Sleepless app to production.

### Method 1: Using Manus Platform (Recommended)

The simplest deployment method uses the built-in Manus platform publishing feature.

**Steps:**

1. **Create a Checkpoint**
   - Ensure all features are complete and tested
   - Click "Save Checkpoint" in the Manus interface
   - Add a descriptive message (e.g., "Production release v1.0.0")

2. **Click Publish**
   - After creating a checkpoint, the "Publish" button becomes active in the top-right corner
   - Click "Publish" to initiate the build process
   - The platform will generate iOS (.ipa) and Android (.apk/.aab) builds

3. **Download Builds**
   - Once builds complete (typically 10-20 minutes), download the generated files
   - iOS: Download the `.ipa` file
   - Android: Download the `.aab` (Android App Bundle) file

4. **Submit to Stores**
   - Upload the iOS `.ipa` to App Store Connect
   - Upload the Android `.aab` to Google Play Console

### Method 2: Using Expo EAS Build (Advanced)

For users who prefer direct control over the build process, Expo Application Services (EAS) provides command-line build tools.

**Prerequisites:**
- Install EAS CLI: `npm install -g eas-cli`
- Login to Expo: `eas login`

**Steps:**

1. **Configure EAS**
   ```bash
   cd /home/ubuntu/sleepless-app
   eas build:configure
   ```

2. **Build for iOS**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Build for Android**
   ```bash
   eas build --platform android --profile production
   ```

4. **Submit to Stores**
   ```bash
   # iOS submission
   eas submit --platform ios
   
   # Android submission
   eas submit --platform android
   ```

---

## App Store Submission (iOS)

### Step 1: Prepare App Store Connect

1. **Create App Record**
   - Log in to [App Store Connect](https://appstoreconnect.apple.com)
   - Click "My Apps" → "+" → "New App"
   - Fill in app information:
     - Platform: iOS
     - Name: Sleepless
     - Primary Language: English
     - Bundle ID: space.manus.sleepless.app.t20251229063622
     - SKU: sleepless-app-001

2. **Add App Information**
   - **Category**: Entertainment or Lifestyle
   - **Subcategory**: Events
   - **Content Rights**: Check if you have rights to use all content

### Step 2: Prepare App Store Assets

Create the following assets for the App Store listing:

| Asset Type | Requirements | Quantity |
|------------|--------------|----------|
| App Icon | 1024x1024 PNG, no transparency | 1 |
| Screenshots (6.7" iPhone) | 1290x2796 PNG | 3-10 |
| Screenshots (6.5" iPhone) | 1284x2778 PNG | 3-10 |
| Screenshots (5.5" iPhone) | 1242x2208 PNG | 3-10 |
| App Preview Video (optional) | Up to 30 seconds, MP4 | 1-3 |

**Recommended Screenshots:**
1. Home screen with logo and navigation buttons
2. Events grid showing event posters
3. Event detail page with booking button
4. QR code ticket display
5. Calendar view with events

### Step 3: Write App Store Description

**App Name:** Sleepless

**Subtitle:** Discover Events Across South Africa

**Description:**
```
Sleepless is South Africa's premier event discovery platform. Find and book tickets to concerts, festivals, club nights, pool parties, and more across all nine provinces.

DISCOVER EVENTS
• Browse events by province and city
• Search across all events instantly
• Filter by type, price, and date
• View events in calendar format

SECURE BOOKING
• Book tickets directly in the app
• Multiple payment methods supported
• QR code tickets prevent fraud
• Instant booking confirmation

NEVER MISS OUT
• Save favorites for later
• Set event reminders
• Push notifications for new events
• Share events with friends

FEATURES
✓ Comprehensive event listings
✓ Secure QR code ticketing
✓ Calendar view and reminders
✓ Social sharing and comments
✓ Profile customization
✓ My Bookings management

Download Sleepless today and discover your next great experience.
```

**Keywords:** events, tickets, concerts, festivals, nightlife, entertainment, booking, south africa

**Support URL:** https://sleepless.co.za/support

**Privacy Policy URL:** https://sleepless.co.za/privacy

### Step 4: Upload Build

1. **Upload IPA**
   - Use Transporter app (Mac) or Xcode to upload the `.ipa` file
   - Wait for processing (10-30 minutes)

2. **Select Build**
   - In App Store Connect, go to your app → "App Store" tab
   - Under "Build", click "+" and select the uploaded build

3. **Submit for Review**
   - Complete all required information
   - Click "Submit for Review"
   - Review typically takes 24-48 hours

### Step 5: App Review Information

Provide the following information to help Apple reviewers test the app:

**Demo Account:**
- Username: reviewer@sleepless.co.za
- Password: ReviewPass2024!

**Notes:**
- The app displays mock event data for demonstration
- QR codes are generated for all bookings
- Push notifications require device permission

---

## Google Play Submission (Android)

### Step 1: Prepare Google Play Console

1. **Create App**
   - Log in to [Google Play Console](https://play.google.com/console)
   - Click "Create app"
   - Fill in app details:
     - App name: Sleepless
     - Default language: English (United States)
     - App or game: App
     - Free or paid: Free

2. **Set Up App**
   - Complete the "Set up your app" checklist
   - Provide privacy policy URL: https://sleepless.co.za/privacy

### Step 2: Prepare Store Listing

Create the following assets for Google Play:

| Asset Type | Requirements | Quantity |
|------------|--------------|----------|
| App Icon | 512x512 PNG | 1 |
| Feature Graphic | 1024x500 PNG | 1 |
| Phone Screenshots | 16:9 or 9:16, PNG/JPEG | 2-8 |
| 7-inch Tablet Screenshots | Optional | 0-8 |
| 10-inch Tablet Screenshots | Optional | 0-8 |

**Recommended Screenshots:**
1. Home screen
2. Events grid
3. Event detail
4. Booking flow
5. QR ticket
6. Calendar view

### Step 3: Write Store Listing

**Short Description (80 characters max):**
```
Discover and book events across South Africa. Concerts, festivals, and more.
```

**Full Description (4000 characters max):**
```
Sleepless is South Africa's premier mobile application for discovering, booking, and experiencing events across all nine provinces. Whether you're looking for daytime festivals, pool parties, concerts, or late-night club events, Sleepless puts the entire entertainment landscape at your fingertips.

🎉 DISCOVER EVENTS
Browse thousands of events across South Africa. Navigate by province and city, or use the powerful search feature to find events by name, venue, artist, or category. View events in a calendar format for easy planning.

🎫 SECURE BOOKING
Book tickets directly in the app with multiple payment options including credit card, EFT, and mobile wallets. Every booking generates a unique QR code ticket that prevents fraud and ensures smooth venue entry.

🔔 NEVER MISS OUT
Save your favorite events, set reminders, and receive push notifications when new events are added in your area. Share events with friends through WhatsApp, SMS, or social media.

✨ KEY FEATURES
• Comprehensive event listings across all 9 provinces
• Smart search and advanced filtering
• Secure QR code ticketing system
• Calendar view for easy planning
• Event reminders and push notifications
• Favorites and bookmarks
• My Bookings management
• Social sharing and comments
• Profile customization
• Multiple payment methods

🎭 EVENT TYPES
• Concerts and live music
• Festivals and outdoor events
• Club nights and DJ sets
• Pool parties and day events
• Rooftop parties
• Comedy shows
• And much more!

📍 NATIONWIDE COVERAGE
Gauteng • Western Cape • KwaZulu-Natal • Eastern Cape • Free State • Mpumalanga • Limpopo • North West • Northern Cape

Download Sleepless today and discover your next great experience. Never miss another event!
```

**App Category:** Events

**Tags:** events, entertainment, tickets, concerts, festivals, nightlife

### Step 4: Content Rating

Complete the content rating questionnaire:
- Violence: None
- Sexual Content: None
- Profanity: None
- Controlled Substances: May reference alcohol (events at bars/clubs)
- Target Age: 18+

### Step 5: Upload App Bundle

1. **Create Release**
   - Go to "Production" → "Create new release"
   - Upload the `.aab` (Android App Bundle) file

2. **Release Notes**
   ```
   Initial release of Sleepless - Your Event Discovery Platform
   
   • Discover events across South Africa
   • Secure QR code ticketing
   • Calendar view and reminders
   • Social sharing features
   • Profile customization
   ```

3. **Review and Rollout**
   - Review all information
   - Click "Start rollout to Production"
   - Review typically takes 1-3 days

---

## Post-Deployment

### Monitoring

After deployment, monitor the following metrics:

| Metric | Tool | Frequency |
|--------|------|-----------|
| Downloads | App Store Connect / Play Console | Daily |
| Crashes | Expo Dashboard | Daily |
| User Reviews | Store listings | Daily |
| Active Users | Analytics | Weekly |

### Updates

For future updates:

1. Increment version number in `app.config.ts`
2. Create new checkpoint with update description
3. Click "Publish" to generate new builds
4. Submit updated builds to stores

**Version Numbering:**
- Major updates: 1.0.0 → 2.0.0
- Minor updates: 1.0.0 → 1.1.0
- Bug fixes: 1.0.0 → 1.0.1

### Support

Prepare support channels for user inquiries:

| Channel | Purpose |
|---------|---------|
| Email | support@sleepless.co.za |
| Social Media | @SleeplessSA (Instagram, Twitter, Facebook) |
| In-App | About screen with contact information |

---

## Troubleshooting

### Common Issues

**Build Fails**

If the build process fails, check the following:
- All required assets are present in `/assets/images/`
- `app.config.ts` has valid configuration
- No TypeScript errors in the codebase
- All dependencies are properly installed

**App Rejected by Apple**

Common rejection reasons and solutions:

| Reason | Solution |
|--------|----------|
| Missing privacy policy | Add privacy policy URL to app config |
| Incomplete app information | Fill all required fields in App Store Connect |
| Crashes during review | Test thoroughly before submission |
| Misleading screenshots | Ensure screenshots accurately represent the app |

**App Rejected by Google**

Common rejection reasons and solutions:

| Reason | Solution |
|--------|----------|
| Content rating issues | Complete content rating questionnaire accurately |
| Privacy policy missing | Add privacy policy to store listing |
| Permissions not justified | Explain permission usage in store listing |
| Crashes on specific devices | Test on various Android versions |

---

## Checklist

Use this checklist before submitting to stores:

### Pre-Submission
- [ ] All features tested and working
- [ ] No console errors or warnings
- [ ] App icons and splash screens configured
- [ ] Privacy policy URL added
- [ ] Support URL added
- [ ] Screenshots captured (iOS and Android)
- [ ] Store descriptions written
- [ ] Demo account created for reviewers
- [ ] Final checkpoint saved

### iOS Submission
- [ ] Apple Developer account active
- [ ] App record created in App Store Connect
- [ ] Build uploaded and processed
- [ ] Screenshots uploaded (all required sizes)
- [ ] App description complete
- [ ] Keywords added
- [ ] Content rating complete
- [ ] Submitted for review

### Android Submission
- [ ] Google Play Console account active
- [ ] App created in Play Console
- [ ] Store listing complete
- [ ] Screenshots uploaded
- [ ] Feature graphic uploaded
- [ ] Content rating complete
- [ ] App bundle uploaded
- [ ] Release rolled out to production

---

## Additional Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)

### Support
- Expo Discord: https://chat.expo.dev/
- Expo Forums: https://forums.expo.dev/
- Stack Overflow: Tag questions with `expo` and `react-native`

---

## Conclusion

The Sleepless app is fully configured and ready for production deployment. Follow this guide to submit the app to both the Apple App Store and Google Play Store. Once approved, users across South Africa will be able to download and use Sleepless to discover and book events.

For questions or assistance with deployment, contact the development team or refer to the resources listed above.

---

**Sleepless**
*Discover. Book. Experience.*

www.sleepless.co.za

---

*Document Version 1.0 | December 2024*
