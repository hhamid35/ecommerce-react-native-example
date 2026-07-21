# Key Flows

## 1. App Startup and Session Routing

Expo starts through `node_modules/expo/AppEntry.js`, which loads `App.js`. `App.js` installs the Redux store and renders the root navigator from `routes/Routes.js`.

The stack navigator starts at `splash`. `screens/auth/Splash.js` reads `authUser` from `utils/authStorage.js`; native platforms use `expo-secure-store`, while web uses AsyncStorage. If a stored user exists, admins are sent to `dashboard` and regular users to `tab`. If no user exists or storage parsing fails, the user is sent to `login`.

## 2. Login and Auth Storage

`screens/auth/LoginScreen.js` validates email and password locally, then checks a hardcoded `HARDCODED_USERS` list instead of calling the mock server's `/login` endpoint. A matched user is stored as `authUser` and routed by `userType`: `ADMIN` goes to `dashboard`, and `USER` goes to the shopper tab navigator.

Most later protected flows assume the stored or route-param user includes a `token` field and send it in the `x-auth-token` header. The bundled mock server recognizes tokens such as `mock-admin-token-001` and `mock-user-token-001`.

## 3. Shopper Catalog, Search, and Cart

The authenticated shopper lands in `routes/tabs/Tabs.js`, which exposes home, categories, my orders, and profile tabs. `screens/user/HomeScreen.js` fetches products from `${network.serverip}/products`, stores the result in local screen state, builds a searchable list, and passes product data into home components such as `SearchBar`, `CategoryList`, and `NewArrivals`.

Adding a product dispatches Redux cart actions from `states/actionCreaters/actionCreaters.js`. The cart reducer in `states/reducers/cartReducer.js` stores cart items under `state.product`, tracks selected quantity, and preserves product fields used by cart and checkout UI. `screens/user/CartScreen.js` reads the cart with `useSelector`, lets users increment, decrement, or remove items, computes the total, and navigates to checkout when the cart is non-empty.

## 4. Checkout and User Orders

`screens/user/CheckoutScreen.js` reads cart items from Redux, collects shipping fields in a modal, computes the order payload, reads `authUser` from storage, and posts to `${network.serverip}/checkout` with `x-auth-token`. On success it dispatches `emptyCart("empty")` and routes to `orderconfirm`.

`screens/user/MyOrderScreen.js` fetches the current user's orders from `/orders` using the stored token and displays them through `OrderList`. The mock server filters orders by the authenticated user's id. Order detail screens receive selected order data through navigation params.

## 5. Admin Dashboard and Management

Admin users route to `screens/admin/DashboardScreen.js`, which fetches `/dashboard` with the admin token. The dashboard maps returned counts into cards for users, orders, products, and categories, and its action list navigates to the corresponding management screens.

Admin list and edit screens call the mock API directly. Product management uses `/products`, `/product`, `/update-product?id=`, and `/delete-product?id=`. Category management uses `/categories`, `/category`, `/update-category?id=`, and `/delete-category?id=`. Order management uses `/admin/orders` and `/admin/order-status?orderId=&status=`. User management uses `/admin/users` and `/delete-user?id=`.

## 6. Mock Server Request Handling

`mock-server/server.js` starts an Express app on `0.0.0.0:3002`, enables CORS and JSON bodies, and serves `/uploads` statically. It keeps users, categories, products, and orders in module-level arrays, so data resets on server restart.

Protected routes pass through `authMiddleware`, which finds a user by `x-auth-token`; admin routes additionally require `userType === "ADMIN"`. Uploads use `multer` to write files to `mock-server/uploads`. Missing uploaded images fall back to an inline SVG placeholder response.

## 7. Build, Lint, and Test Commands

The main app uses Expo scripts from `package.json`: `npm start`, `npm run android`, `npm run ios`, and `npm run web`. Tests run with `npm test` using the `jest-expo` preset, while linting is exposed as `npm run lint`. Staging mobile builds are configured through EAS with `npm run build:staging:android` and `npm run build:staging:ios`.
