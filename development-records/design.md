# Sleepless - Mobile App Interface Design

## App Overview
Sleepless is a nightlife events discovery app for South Africa. Users can browse events by province and city, view event details, get directions, and interact with other users through comments. The app follows Apple Human Interface Guidelines with a dark, atmospheric design that evokes the nightlife theme.

## Screen List

### Authentication Flow
1. **Login Screen** - Username/password login with option to create account
2. **Register Screen** - Account creation with username, password, email, and date of birth

### Main App Flow
3. **Home Screen** - Central hub with user profile, Events and About buttons
4. **Province Selection Screen** - List of 9 South African provinces
5. **City Selection Screen** - List of cities within selected province
6. **Events Grid Screen** - Grid of event posters with search functionality
7. **Event Preview Screen** - Single event poster with basic info and "More info" button
8. **Event Detail Screen** - Full event details with Location, Comments, Bookings buttons
9. **Location Screen** - Map view with search and share location features
10. **Comments Screen** - Social feed with photos, likes, comments, and status posting
11. **About Screen** - App information

## Primary Content and Functionality

### Login Screen
- App logo "Sleepless" in cursive script
- User avatar placeholder (circular, gray)
- Username input field with person icon
- Password input field with lock icon
- "LOGIN" button (coral/orange)
- "or you can create an account" link text

### Register Screen
- Back navigation arrow
- "Create an account" header
- Avatar placeholder for profile photo
- Form fields: Username, Password, Confirm Password, Email, Date of Birth
- "Submit" button

### Home Screen
- Sign out option (top-left corner)
- "Sleepless" logo centered
- User avatar (circular)
- Two large circular buttons:
  - Events (calendar grid icon)
  - About (question mark icon)

### Province Selection Screen
- "Events" header with calendar icon
- Scrollable list of 9 provinces as buttons:
  - Eastern Cape, Freestate, Gauteng, KwaZulu-Natal, Limpopo, Mpumalanga, Northern Cape, North West, Western Cape
- Home icon at bottom for navigation back

### City Selection Screen
- "Events" header with calendar icon
- Province name as subheader
- List of cities for that province (5-6 cities each)
- Home icon at bottom

### Events Grid Screen
- "Events" header with calendar icon
- Search bar with magnifying glass
- 3-column grid of event poster thumbnails
- Scrollable content
- Home icon at bottom

### Event Preview Screen
- "Events" header with calendar icon
- Search bar
- Large circular event poster image
- Event name (bold)
- Date and Venue info line
- "More info" button
- Home icon at bottom

### Event Detail Screen
- "Events" header with calendar icon
- Event name
- Circular event poster
- Details section:
  - Date
  - Venue
  - Time
  - Line up (performers/DJs)
- Three action buttons:
  - Location (opens map)
  - Comments (opens social feed)
  - Bookings (booking action)
- Home icon at bottom

### Location Screen
- "Location" header with pin icon
- Map display (static or interactive)
- "Search location" input field
- "Share Location" button
- Transport mode icons (walking, driving)
- Home icon at bottom

### Comments Screen
- Status input bar with avatar ("Write a status...")
- Photo/image posts in feed
- Each post shows:
  - User avatar and username
  - Image content
  - Like count (heart icon)
  - Comment count (speech bubble)
- Bottom bar with Home and Camera icons

## Key User Flows

### Event Discovery Flow
1. User logs in → Home Screen
2. Taps "Events" button → Province Selection
3. Selects province (e.g., Gauteng) → City Selection
4. Selects city (e.g., Joburg) → Events Grid
5. Taps event poster → Event Preview
6. Taps "More info" → Event Detail
7. Can tap Location, Comments, or Bookings

### Social Interaction Flow
1. From Event Detail → Tap "Comments"
2. View social feed of photos/posts
3. Can write status or take photo
4. Like and comment on posts

### Location Flow
1. From Event Detail → Tap "Location"
2. View map with venue location
3. Search for directions
4. Share location or get transport options

## Color Choices

### Primary Palette
- **Background**: Deep purple-blue gradient (#1a1a2e to #16213e)
- **Primary Accent**: Coral/Orange (#ff6b6b) - for buttons and CTAs
- **Secondary Accent**: Soft purple (#a855f7) - for highlights
- **Text Primary**: White (#ffffff)
- **Text Secondary**: Light gray (#9ca3af)
- **Surface**: Semi-transparent white (rgba(255,255,255,0.1))
- **Border**: Semi-transparent white (rgba(255,255,255,0.2))

### UI Element Colors
- Input fields: Semi-transparent dark with white text
- Buttons: Coral/orange gradient
- Icons: White with circular borders
- Cards: Glassmorphism effect (blur + transparency)

## Typography
- Logo: Cursive/script font (custom or similar to Pacifico/Dancing Script)
- Headers: Bold sans-serif
- Body: Regular sans-serif
- All text: White or light gray on dark backgrounds

## Design Principles
1. **Dark Theme First**: Matches nightlife atmosphere
2. **Glassmorphism**: Semi-transparent elements with blur
3. **Circular Elements**: Profile avatars, event posters, action buttons
4. **Bottom Navigation**: Home icon always accessible
5. **Visual Hierarchy**: Large imagery, clear CTAs
6. **One-Handed Use**: Important actions within thumb reach
