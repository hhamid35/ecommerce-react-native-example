# EasyBuy — Overview

## What this repository does

EasyBuy is a cross-platform Expo React Native ecommerce app with shopper and admin experiences. The mobile app supports splash/login routing, product browsing, categories, cart and checkout, order history, user profile screens, and admin management screens for products, categories, orders, users, and dashboard stats. A local Express mock server is included to emulate the backend APIs used by the app.

## Tech stack

- **Language(s):** JavaScript for the Expo app and mock server.
- **Framework(s):** Expo SDK 55, React 19, React Native 0.83, React Navigation 7, Redux 5 with redux-thunk, Express 4 for the mock API.
- **Key dependencies:** `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `react-redux`, `@react-native-async-storage/async-storage`, `expo-secure-store`, `expo-image-picker`, `expo-file-system`, `multer`, `cors`, `uuid`, `jest-expo`.
- **Datastores / infra (if evident from config):** No persistent database is configured. The mock server stores users, categories, products, and orders in memory and serves uploaded files from `mock-server/uploads`. EAS build profiles exist for local and staging builds.

## Entry points

- `package.json` — Expo scripts (`npm start`, `npm run android`, `npm run ios`, `npm run web`) and Jest lint/test entry points.
- `App.js` — React Native root component; installs the Redux `Provider` and renders `routes/Routes`.
- `routes/Routes.js` — top-level React Navigation native stack, starting at `splash`.
- `routes/tabs/Tabs.js` — authenticated shopper tab navigator for home, categories, orders, and profile.
- `mock-server/server.js` — Express mock API process on port `3002`.
- `mock-server/package.json` — mock server scripts (`npm start`, `npm run dev`, `npm run download-images`).

## Top-level layout at a glance

- `screens` — route-level React Native screens split by `auth`, `user`, `profile`, and `admin`.
- `components` — reusable UI pieces used by screens, including product/order lists, buttons, inputs, cards, and home widgets.
- `routes` — stack and tab navigation registration.
- `states` — Redux store, cart reducer, action types, and thunk action creators.
- `constants` — theme colors, static app data, and API base URL configuration.
- `mock-server` — local Express API implementation and mock data for development/preview.

## Notes for future agents

The README describes a MERN backend and links an external Node repository, but this checkout includes a self-contained mock Express server and no MongoDB client or schema. `constants/Network.js` uses `EXPO_PUBLIC_API_URL` when injected by ALORA preview infrastructure and otherwise falls back to `http://10.0.2.2:3002`; `mock-server/README.md` still mentions port `3001`, while `server.js` and the app fallback use `3002`. Login currently checks hardcoded users in `screens/auth/LoginScreen.js` instead of calling `/login`; other protected flows expect a token on the stored user object.
