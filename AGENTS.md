# FinanceApp — Agent Handoff Context

## Project

- Project path: `D:\Monocept\React-Native\Finance-App\New-App\FinanceApp`
- React Native: `0.86.0`
- React: `19.2.3`
- Android application ID: `com.financeapp`
- Primary target: Android physical device
- Current app model: local/offline finance tracker

## Important working rule

Proceed one milestone at a time. After each native or feature milestone, run the app on the physical phone and verify it before starting the next milestone.

Do not add Firebase authentication unless the user explicitly decides to resume it. Authentication was intentionally deferred because the user wants the app working incrementally without repeated long native builds.

## Current dependencies

Installed application dependencies include:

- `@react-native-async-storage/async-storage`
- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `@react-native-google-signin/google-signin`
- `@react-native/new-app-screen`
- `@react-navigation/bottom-tabs`
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `react-native-image-picker`
- `react-native-safe-area-context`
- `react-native-screens`
- `react-native-vector-icons`

Firebase and Google Sign-In packages are installed, but authentication is not currently used by the JavaScript app.

## Completed features

The app currently has:

- Bottom-tab navigation: Dashboard, Add, History, Profile.
- Local transaction persistence with AsyncStorage.
- Income and expense transactions.
- Amount validation requiring a finite value greater than zero.
- Transaction descriptions and categories.
- Categories: Food, Transport, Shopping, Bills, Health, Entertainment, Salary, Other.
- Dashboard income, expense, and current-balance totals.
- Dashboard recent transactions.
- Dashboard monthly top-spending-category summary.
- History list.
- History search by description/category.
- History filtering by transaction type and category.
- Transaction editing from History.
- Transaction deletion with confirmation.
- Local profile photo selection from the photo library.
- Profile photo persistence with AsyncStorage.
- Profile photo removal.
- Missing tab-icon glyphs hidden intentionally until an icon system is configured correctly.

## Important files

- `App.tsx` — root providers and navigation container.
- `src/navigation/MainTabs.jsx` — bottom tabs and tab-bar styling.
- `src/screens/DashboardScreen.jsx` — totals, monthly breakdown, recent transactions.
- `src/screens/AddTransactionScreen.jsx` — create transaction form.
- `src/screens/HistoryScreen.jsx` — search, filters, edit modal, delete actions.
- `src/screens/ProfileScreen.jsx` — local profile photo.
- `src/services/transactionService.js` — AsyncStorage transaction CRUD.
- `android/app/google-services.json` — Firebase native configuration, currently not required by the active UI.

## Data storage

Transactions are currently stored under one local AsyncStorage key:

```text
@finance_app_transactions
```

Profile photo is stored under:

```text
@finance_app_profile_photo
```

Because authentication is deferred, this is intentionally single-device/local data. Do not claim that data is user-isolated until authentication and per-user storage keys are implemented.

## Commands

Run commands from:

```powershell
cd D:\Monocept\React-Native\Finance-App\New-App\FinanceApp
```

Start Metro:

```powershell
npm start
```

Build/install Android:

```powershell
npm run android
```

Use a full Android rebuild after installing or changing native dependencies. JavaScript-only screen and style changes normally need only a Metro reload.

If Gradle dependencies must be refreshed:

```powershell
.\android\gradlew.bat -p android app:installDebug --refresh-dependencies
```

If Gradle becomes stuck:

```powershell
.\android\gradlew.bat -p android --stop
```

## Firebase/authentication status

The Android Gradle Google Services plugin and Firebase packages were installed during setup. A Firebase project/configuration was created for `com.financeapp`, but the downloaded `google-services.json` was inspected and contained only a Web OAuth client (`client_type: 3`) without an Android OAuth client (`client_type: 1`).

Therefore Google Sign-In must remain deferred until all of the following are true:

1. Firebase has an Android app registered with package name `com.financeapp`.
2. Debug SHA-1 and SHA-256 fingerprints are registered.
3. A new `google-services.json` is downloaded and contains an Android OAuth client.
4. Google is enabled in Firebase Authentication → Sign-in method.
5. The native build succeeds after replacing the configuration file.

The debug fingerprints can be displayed with:

```powershell
.\android\gradlew.bat -p android signingReport
```

Do not add login UI until the Firebase configuration has an Android OAuth client. Otherwise the phone will typically return Google Sign-In `DEVELOPER_ERROR`.

## Next recommended milestones

### 1. Test and polish the current local app

Verify on the phone:

- Add income and expense.
- Edit amount, type, description, and category.
- Search and filter History.
- Delete a transaction.
- Restart the app and confirm data persists.
- Select, replace, remove, and reload the profile photo.
- Confirm the compact category chips and tab bar look correct.

### 2. Add local data safety

Improve `transactionService.js` with:

- Safe handling of malformed stored JSON.
- A storage version key.
- A migration path for future schema changes.
- Optional export/import of local transactions.

### 3. Add dashboard date controls

Add a month selector so the monthly category summary can switch between months instead of always showing the current month.

### 4. Add budgets without authentication

Add a local monthly budget setting and show remaining budget/progress on Dashboard. Store it in a separate AsyncStorage key.

### 5. Decide whether to resume authentication

If the user wants cloud identity or multi-device data, complete Firebase setup first, then add:

- Auth state listener.
- Google sign-in.
- Sign-out.
- Authenticated profile display.
- Per-user transaction and photo keys.
- Migration strategy from the current single local key.

If authentication remains deferred, keep the app explicitly local/offline and do not add user-isolation claims.

## Known caveats

- The app currently uses dollar formatting (`$`) and does not have a currency setting.
- The app currently has no cloud backup.
- The app currently has no authentication.
- Release signing still needs a real release keystore before publishing.
- Release SHA fingerprints must be added to Firebase if authentication is later enabled.
- `react-native-vector-icons` is installed but tab icons are intentionally hidden because the previous UI showed missing-glyph boxes. Configure and test icons separately before showing them.

## Handoff instruction

Before changing code, inspect the current files in `src/screens`, `src/navigation`, and `src/services`; preserve the working local transaction behavior. Prefer JavaScript-only changes to avoid another native build unless a native dependency or Android configuration genuinely requires one.
