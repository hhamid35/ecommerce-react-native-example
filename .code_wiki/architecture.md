# Architecture

EasyBuy is a single Expo React Native app backed by a local mock API server. The client and server are in the same repository but run as separate Node processes.

## Major Components

- **Expo app shell:** `App.js` imports `react-native-gesture-handler`, wraps the app in the Redux `Provider`, and renders the root navigation tree.
- **Navigation layer:** `routes/Routes.js` defines the native stack for splash, auth, shopper, profile, checkout, order, and admin screens. `routes/tabs/Tabs.js` defines the authenticated shopper bottom tabs and passes the authenticated user into tab screens through route params.
- **Screen layer:** `screens/auth`, `screens/user`, `screens/profile`, and `screens/admin` contain route-level components. These screens own most data fetching, form state, navigation decisions, and API request construction.
- **Component layer:** `components` contains reusable presentational pieces such as list rows, product cards, inputs, buttons, alerts, category widgets, and home screen sections. Data generally flows into these components through props from screens.
- **State layer:** `states/store.js` creates a Redux store with thunk middleware. The only combined reducer is `product`, implemented by `states/reducers/cartReducer.js`, which represents cart items and quantities.
- **Shared constants and utilities:** `constants/Colors.js`, `constants/AppData.js`, and `constants/Network.js` provide styling values, static category/banner data, and the API base URL. `utils/authStorage.js` abstracts session persistence over `expo-secure-store` on native and AsyncStorage on web.
- **Mock API server:** `mock-server/server.js` is an Express app with in-memory users, products, categories, and orders. It exposes auth, catalog, checkout, admin, image upload, and upload-serving endpoints.

## Call Direction and Data Flow

The runtime call direction is mostly top-down:

`App.js` -> `routes/Routes.js` -> screen components -> reusable components.

Screens call `fetch()` directly against `network.serverip`, then update local component state or dispatch Redux cart actions. The Redux store is only used for the cart; product, category, order, user, and dashboard data are fetched and stored in screen-local state.

Protected API requests read `authUser` from secure storage or route params and send the token through the `x-auth-token` header. The mock server validates this header against pre-seeded in-memory users and applies an admin check for admin-only endpoints.

## Client/Server Boundary

The app expects these broad API groups from the backend:

- Public auth and catalog routes: `/register`, `/login`, `/products`, `/categories`.
- User routes: `/orders`, `/checkout`, `/reset-password`, `/delete-user`.
- Admin routes: `/dashboard`, `/admin/orders`, `/admin/users`, `/admin/order-status`, product CRUD, and category CRUD.
- Media routes: `/photos/upload` for uploads and `/uploads/:filename` for serving images or SVG placeholders.

The bundled mock server implements these endpoints in one file and resets all non-upload data whenever it restarts.

## Build and Runtime Configuration

Expo configuration lives in `app.json`, with bundle/package identifiers, image picker and secure store plugins, runtime version policy, and an EAS project id. `eas.json` defines local development-client and staging internal distribution profiles. The app's server URL is controlled by `EXPO_PUBLIC_API_URL` when present, otherwise it falls back to the Android emulator loopback URL on port `3002`.

## Testing Surface

Jest is configured through `package.json` with the `jest-expo` preset. The current test coverage is minimal and includes a constants test under `__tests__/colors.test.js`.
