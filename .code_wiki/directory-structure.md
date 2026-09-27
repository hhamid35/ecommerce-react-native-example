# Directory Structure

Annotated tree limited to depth 3.

```text
.
├── __tests__/                 # Jest tests; currently focused on constants.
├── assets/                    # App images, icons, logos, and Expo static assets.
│   ├── icons/                 # Tab, category, cart, and UI icon images.
│   ├── image/                 # Banner and product-related image assets.
│   └── logo/                  # EasyBuy logo variants used by auth/splash screens.
├── components/                # Reusable React Native UI components.
│   ├── BasicProductList/      # Compact product rows used in checkout summaries.
│   ├── CartProductList/       # Cart row UI with quantity controls.
│   ├── CategoryList/          # Category list rendering component.
│   ├── CustomAlert/           # App alert/message presentation.
│   ├── CustomButton/          # Shared button component.
│   ├── CustomCard/            # Dashboard/stat card component.
│   ├── CustomIconButton/      # Icon button wrapper.
│   ├── CustomInput/           # Shared text input component.
│   ├── HomeScreen/            # Home-specific sections: header, search, slider, arrivals.
│   ├── OrderList/             # Order list row component.
│   ├── OptionList/            # Admin dashboard action rows.
│   ├── ProductCard/           # Product card UI.
│   ├── ProductList/           # Admin product list rows.
│   ├── UserList/              # Admin user list rows.
│   ├── UserProfileCard/       # User profile card UI.
│   └── WishList/              # Wishlist UI components.
├── constants/                 # Shared app constants and API endpoint configuration.
├── image/                     # README/mockup imagery.
├── mock-server/               # Local Express mock backend.
│   ├── server.js              # In-memory API server and route definitions.
│   ├── download-images.js     # Helper script for mock image assets.
│   └── package.json           # Mock server dependencies and scripts.
├── routes/                    # React Navigation registration.
│   └── tabs/                  # Bottom tab navigator for authenticated users.
├── screens/                   # Route-level screen components.
│   ├── admin/                 # Admin dashboard and CRUD screens.
│   ├── auth/                  # Splash, login, signup, and password recovery screens.
│   ├── profile/               # Account, profile, wishlist, and password screens.
│   └── user/                  # Shopper home, catalog, cart, checkout, and order screens.
├── screenshot/                # App screenshots or visual reference assets.
├── states/                    # Redux store, reducers, action types, and action creators.
│   ├── actionCreaters/        # Thunk-style cart action creators.
│   ├── actionTypes/           # Cart action constants.
│   └── reducers/              # Combined reducer and cart reducer.
├── utils/                     # Cross-platform helper utilities.
├── App.js                     # Expo app root component.
├── app.json                   # Expo app metadata, plugins, bundle ids, and EAS project id.
├── eas.json                   # EAS local and staging build profiles.
├── eslint.config.js           # ESLint configuration.
├── metro.config.js            # Metro bundler configuration.
├── package.json               # Main app dependencies and scripts.
└── README.md                  # Project overview and run instructions.
```

Notable generated or dependency directories such as `node_modules` are not part of the repository map.
