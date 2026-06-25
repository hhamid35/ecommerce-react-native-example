const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const {
  normalizeLookupCode,
  resolveProductByCode,
} = require("./productLookup");
const {
  isVerifiedPurchaser,
  findActiveReview,
  computeSummary,
  toPublicReview,
  toAuthorReview,
} = require("./reviewHelpers");

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Multer setup for image uploads ───────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ─── In-memory data store ──────────────────────────────────────────────────────

let users = [
  {
    _id: "admin001",
    name: "Admin User",
    email: "admin@easybuy.com",
    password: "admin123",
    userType: "ADMIN",
    token: "mock-admin-token-001",
  },
  {
    _id: "user001",
    name: "John Doe",
    email: "user@easybuy.com",
    password: "user123",
    userType: "USER",
    token: "mock-user-token-001",
  },
  {
    _id: "user002",
    name: "Jane Smith",
    email: "jane@easybuy.com",
    password: "jane123",
    userType: "USER",
    token: "mock-user-token-002",
  },
];

let categories = [
  {
    _id: "62fe244f58f7aa8230817f89",
    title: "Garments",
    description: "Clothing and fashion items",
    icon: "garments.png",
  },
  {
    _id: "62fe243858f7aa8230817f86",
    title: "Electronics",
    description: "Electronic devices and accessories",
    icon: "electronics.png",
  },
  {
    _id: "62fe241958f7aa8230817f83",
    title: "Cosmetics",
    description: "Beauty and personal care products",
    icon: "cosmetics.png",
  },
  {
    _id: "62fe246858f7aa8230817f8c",
    title: "Groceries",
    description: "Food and daily essentials",
    icon: "grocery.png",
  },
];

let products = [
  {
    _id: "prod001",
    title: "Classic White T-Shirt",
    sku: "GAR-001",
    externalId: "",
    price: 19.99,
    quantity: 50,
    description: "A comfortable everyday white t-shirt made from 100% cotton.",
    image: "tshirt.png",
    category: {
      _id: "62fe244f58f7aa8230817f89",
      title: "Garments",
    },
  },
  {
    _id: "prod002",
    title: "Blue Denim Jeans",
    sku: "GAR-002",
    externalId: "",
    price: 49.99,
    quantity: 30,
    description: "Slim-fit blue denim jeans for a modern look.",
    image: "jeans.png",
    category: {
      _id: "62fe244f58f7aa8230817f89",
      title: "Garments",
    },
  },
  {
    _id: "prod003",
    title: "Wireless Bluetooth Headphones",
    sku: "ELC-001",
    externalId: "885909950805",
    price: 89.99,
    quantity: 20,
    description: "High-quality wireless headphones with noise cancellation.",
    image: "headphones.png",
    category: {
      _id: "62fe243858f7aa8230817f86",
      title: "Electronics",
    },
  },
  {
    _id: "prod004",
    title: "Smartphone Stand",
    sku: "ELC-002",
    externalId: "",
    price: 14.99,
    quantity: 100,
    description: "Adjustable aluminum smartphone and tablet stand.",
    image: "stand.png",
    category: {
      _id: "62fe243858f7aa8230817f86",
      title: "Electronics",
    },
  },
  {
    _id: "prod005",
    title: "Face Moisturizer SPF 30",
    sku: "COS-001",
    externalId: "",
    price: 24.99,
    quantity: 60,
    description: "Daily face moisturizer with SPF 30 sun protection.",
    image: "moisturizer.png",
    category: {
      _id: "62fe241958f7aa8230817f83",
      title: "Cosmetics",
    },
  },
  {
    _id: "prod006",
    title: "Lipstick Set (6 Colors)",
    sku: "COS-002",
    externalId: "",
    price: 34.99,
    quantity: 40,
    description: "Long-lasting matte lipstick set in 6 vibrant shades.",
    image: "lipstick.png",
    category: {
      _id: "62fe241958f7aa8230817f83",
      title: "Cosmetics",
    },
  },
  {
    _id: "prod007",
    title: "Organic Basmati Rice (5kg)",
    sku: "GRO-001",
    externalId: "",
    price: 12.99,
    quantity: 200,
    description: "Premium organic basmati rice, long grain and aromatic.",
    image: "rice.png",
    category: {
      _id: "62fe246858f7aa8230817f8c",
      title: "Groceries",
    },
  },
  {
    _id: "prod008",
    title: "Extra Virgin Olive Oil (1L)",
    sku: "GRO-002",
    externalId: "",
    price: 18.99,
    quantity: 80,
    description: "Cold-pressed extra virgin olive oil from Mediterranean farms.",
    image: "oliveoil.png",
    category: {
      _id: "62fe246858f7aa8230817f8c",
      title: "Groceries",
    },
  },
];

let orders = [
  {
    _id: "order001",
    orderId: "ORD-2024-001",
    user: {
      _id: "user001",
      name: "John Doe",
      email: "user@easybuy.com",
    },
    items: [
      {
        productId: {
          _id: "prod001",
          title: "Classic White T-Shirt",
        },
        price: 19.99,
        quantity: 2,
      },
      {
        productId: {
          _id: "prod003",
          title: "Wireless Bluetooth Headphones",
        },
        price: 89.99,
        quantity: 1,
      },
    ],
    amount: 129.97,
    discount: 0,
    payment_type: "cod",
    country: "Canada",
    city: "Toronto",
    zipcode: "M5V 3A8",
    shippingAddress: "123 Main Street",
    status: "pending",
    createdAt: new Date("2024-01-15T10:30:00Z").toISOString(),
    updatedAt: new Date("2024-01-15T10:30:00Z").toISOString(),
  },
  {
    _id: "order002",
    orderId: "ORD-2024-002",
    user: {
      _id: "user002",
      name: "Jane Smith",
      email: "jane@easybuy.com",
    },
    items: [
      {
        productId: {
          _id: "prod005",
          title: "Face Moisturizer SPF 30",
        },
        price: 24.99,
        quantity: 1,
      },
    ],
    amount: 24.99,
    discount: 0,
    payment_type: "cod",
    country: "Canada",
    city: "Vancouver",
    zipcode: "V6B 1A1",
    shippingAddress: "456 Oak Avenue",
    status: "shipped",
    shippedOn: "2024-01-17",
    createdAt: new Date("2024-01-16T14:00:00Z").toISOString(),
    updatedAt: new Date("2024-01-17T09:00:00Z").toISOString(),
  },
  {
    _id: "order003",
    orderId: "ORD-2024-003",
    user: {
      _id: "user001",
      name: "John Doe",
      email: "user@easybuy.com",
    },
    items: [
      {
        productId: {
          _id: "prod007",
          title: "Organic Basmati Rice (5kg)",
        },
        price: 12.99,
        quantity: 3,
      },
    ],
    amount: 38.97,
    discount: 0,
    payment_type: "cod",
    country: "Canada",
    city: "Toronto",
    zipcode: "M5V 3A8",
    shippingAddress: "123 Main Street",
    status: "delivered",
    shippedOn: "2024-01-10",
    deliveredOn: "2024-01-12",
    createdAt: new Date("2024-01-09T08:00:00Z").toISOString(),
    updatedAt: new Date("2024-01-12T16:00:00Z").toISOString(),
  },
];

let reviews = [
  {
    _id: "rev-seed-001",
    productId: "prod007",
    userId: "user001",
    user: { _id: "user001", name: "John Doe" },
    rating: 5,
    text: "Great rice! Aromatic and cooks perfectly every time.",
    verifiedPurchase: true,
    visibility: "published",
    createdAt: "2024-02-01T10:00:00.000Z",
    updatedAt: "2024-02-01T10:00:00.000Z",
  },
  {
    _id: "rev-seed-002",
    productId: "prod005",
    userId: "user002",
    user: { _id: "user002", name: "Jane Smith" },
    rating: 4,
    text: "Good moisturizer, absorbs quickly.",
    verifiedPurchase: true,
    visibility: "published",
    createdAt: "2024-02-02T14:30:00.000Z",
    updatedAt: "2024-02-02T14:30:00.000Z",
  },
  {
    _id: "rev-seed-003",
    productId: "prod001",
    userId: "user001",
    user: { _id: "user001", name: "John Doe" },
    rating: 3,
    text: "Decent shirt but runs a bit small.",
    verifiedPurchase: true,
    visibility: "hidden",
    createdAt: "2024-02-03T09:15:00.000Z",
    updatedAt: "2024-02-03T09:15:00.000Z",
  },
];

// ─── Auth middleware (simple token check) ─────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers["x-auth-token"];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  const user = users.find((u) => u.token === token);
  if (!user) {
    return res.status(401).json({ success: false, err: "jwt expired", message: "Invalid or expired token" });
  }
  req.user = user;
  next();
};

const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.userType !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    next();
  });
};

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /register
app.post("/register", (req, res) => {
  const { email, password, name, userType } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }
  const newUser = {
    _id: uuidv4(),
    name,
    email,
    password,
    userType: userType || "USER",
    token: `mock-token-${uuidv4()}`,
  };
  users.push(newUser);
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ success: true, message: "User registered successfully", data: safeUser });
});

// POST /login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }
  const { password: _, ...safeUser } = user;
  res.json({ success: true, message: "Login successful", data: safeUser });
});

// GET /products
app.get("/products", (req, res) => {
  res.json({ success: true, data: products });
});

// GET /products/lookup?code=
app.get("/products/lookup", (req, res) => {
  const { code } = req.query;
  const normalized = normalizeLookupCode(code);

  if (!normalized) {
    return res.status(400).json({
      success: false,
      message: "Query parameter code is required",
    });
  }

  const match = resolveProductByCode(normalized, products);

  console.log(
    JSON.stringify({
      event: "product_lookup",
      code: normalized,
      found: !!match,
      matchedBy: match ? match.matchedBy : null,
    })
  );

  if (!match) {
    return res.status(404).json({
      success: false,
      message: "No product found for scanned code",
      code: normalized,
    });
  }

  res.json({
    success: true,
    data: match.product,
    matchedBy: match.matchedBy,
  });
});

// POST /product  (admin: add product)
app.post("/product", adminMiddleware, (req, res) => {
  const { title, sku, price, image, description, category, quantity, externalId } = req.body;
  if (!title || !price) {
    return res.status(400).json({ success: false, message: "Title and price are required" });
  }
  const cat = categories.find((c) => c._id === category);
  const newProduct = {
    _id: uuidv4(),
    title,
    sku: sku || "",
    externalId: externalId || "",
    price: parseFloat(price),
    quantity: parseInt(quantity) || 0,
    description: description || "",
    image: image || "default.png",
    category: cat ? { _id: cat._id, title: cat.title } : { _id: category, title: "Unknown" },
  };
  products.push(newProduct);
  res.json({ success: true, message: "Product added successfully", data: newProduct });
});

// POST /update-product?id=
app.post("/update-product", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = products.findIndex((p) => p._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  const { title, sku, price, image, description, category, quantity, externalId } = req.body;
  const cat = categories.find((c) => c._id === category);
  products[idx] = {
    ...products[idx],
    title: title || products[idx].title,
    sku: sku || products[idx].sku,
    externalId: externalId !== undefined ? externalId : products[idx].externalId,
    price: price ? parseFloat(price) : products[idx].price,
    quantity: quantity !== undefined ? parseInt(quantity) : products[idx].quantity,
    description: description || products[idx].description,
    image: image || products[idx].image,
    category: cat ? { _id: cat._id, title: cat.title } : products[idx].category,
  };
  res.json({ success: true, message: "Product updated successfully", data: products[idx] });
});

// GET /delete-product?id=
app.get("/delete-product", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = products.findIndex((p) => p._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  products.splice(idx, 1);
  res.json({ success: true, message: "Product deleted successfully" });
});

// GET /categories
app.get("/categories", (req, res) => {
  res.json({ success: true, categories });
});

// POST /category  (admin: add category)
app.post("/category", adminMiddleware, (req, res) => {
  const { title, image, description } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }
  const newCategory = {
    _id: uuidv4(),
    title,
    description: description || "",
    icon: image || "default.png",
  };
  categories.push(newCategory);
  res.json({ success: true, message: "Category added successfully", data: newCategory });
});

// POST /update-category?id=
app.post("/update-category", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = categories.findIndex((c) => c._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }
  const { title, image, description } = req.body;
  categories[idx] = {
    ...categories[idx],
    title: title || categories[idx].title,
    description: description || categories[idx].description,
    icon: image || categories[idx].icon,
  };
  res.json({ success: true, message: "Category updated successfully", data: categories[idx] });
});

// GET /delete-category?id=
app.get("/delete-category", adminMiddleware, (req, res) => {
  const { id } = req.query;
  const idx = categories.findIndex((c) => c._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }
  categories.splice(idx, 1);
  res.json({ success: true, message: "Category deleted successfully" });
});

// GET /dashboard  (admin)
app.get("/dashboard", adminMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      usersCount: users.filter((u) => u.userType === "USER").length,
      ordersCount: orders.length,
      productsCount: products.length,
      categoriesCount: categories.length,
      reviewsCount: reviews.filter((r) => r.visibility !== "removed").length,
    },
  });
});

// GET /admin/orders  (admin: all orders)
app.get("/admin/orders", adminMiddleware, (req, res) => {
  res.json({ success: true, data: orders });
});

// GET /admin/users  (admin: all users)
app.get("/admin/users", adminMiddleware, (req, res) => {
  const safeUsers = users.map(({ password, token, ...u }) => u);
  res.json({ success: true, data: safeUsers });
});

// GET /admin/order-status?orderId=&status=  (admin: update order status)
app.get("/admin/order-status", adminMiddleware, (req, res) => {
  const { orderId, status } = req.query;
  const validStatuses = ["pending", "shipped", "delivered"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }
  const order = orders.find((o) => o._id === orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  order.status = status;
  order.updatedAt = new Date().toISOString();
  if (status === "shipped") order.shippedOn = new Date().toISOString().split("T")[0];
  if (status === "delivered") order.deliveredOn = new Date().toISOString().split("T")[0];
  res.json({ success: true, message: `Order status updated to ${status}`, data: order });
});

// GET /orders  (user: their own orders)
app.get("/orders", authMiddleware, (req, res) => {
  const userOrders = orders.filter((o) => o.user._id === req.user._id);
  res.json({ success: true, data: userOrders });
});

// POST /checkout  (user: place order)
app.post("/checkout", authMiddleware, (req, res) => {
  const { items, amount, discount, payment_type, country, city, zipcode, shippingAddress, status } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }
  const orderItems = items.map((item) => {
    const product = products.find((p) => p._id === item.productId);
    return {
      productId: product
        ? { _id: product._id, title: product.title }
        : { _id: item.productId, title: "Unknown Product" },
      price: item.price,
      quantity: item.quantity,
    };
  });
  const newOrder = {
    _id: uuidv4(),
    orderId: `ORD-${Date.now()}`,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
    items: orderItems,
    amount: amount || 0,
    discount: discount || 0,
    payment_type: payment_type || "cod",
    country: country || "",
    city: city || "",
    zipcode: zipcode || "",
    shippingAddress: shippingAddress || "",
    status: status || "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  res.json({ success: true, message: "Order placed successfully", data: newOrder });
});

// GET /delete-user?id=
app.get("/delete-user", (req, res) => {
  const { id } = req.query;
  const idx = users.findIndex((u) => u._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  const deleted = users.splice(idx, 1)[0];
  const { password, token, ...safeUser } = deleted;
  res.json({ success: true, message: "Account deleted successfully", data: safeUser });
});

// POST /reset-password?id=
app.post("/reset-password", (req, res) => {
  const { id } = req.query;
  const { password, newPassword } = req.body;
  const user = users.find((u) => u._id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (user.password !== password) {
    return res.status(401).json({ success: false, message: "Current password is incorrect" });
  }
  user.password = newPassword;
  res.json({ success: true, message: "Password updated successfully" });
});

// GET /products/:productId/reviews  (public)
app.get("/products/:productId/reviews", (req, res) => {
  const { productId } = req.params;
  const product = products.find((p) => p._id === productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  let limit = parseInt(req.query.limit, 10) || 10;
  if (limit > 50) limit = 50;
  if (limit < 1) limit = 10;

  const summary = computeSummary(productId, reviews);
  let publishedReviews = reviews
    .filter((r) => r.productId === productId && r.visibility === "published")
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit)
    .map(toPublicReview);

  const token = req.headers["x-auth-token"];
  if (token) {
    const user = users.find((u) => u.token === token);
    if (user) {
      const hiddenReview = reviews.find(
        (r) =>
          r.productId === productId &&
          r.userId === user._id &&
          r.visibility === "hidden"
      );
      if (hiddenReview) {
        publishedReviews = [...publishedReviews, toAuthorReview(hiddenReview)];
      }
    }
  }

  res.json({
    success: true,
    data: { summary, reviews: publishedReviews },
  });
});

// GET /products/:productId/reviews/eligibility  (auth required)
app.get("/products/:productId/reviews/eligibility", authMiddleware, (req, res) => {
  const { productId } = req.params;
  const product = products.find((p) => p._id === productId);
  if (!product) {
    return res.status(200).json({
      success: true,
      data: { eligible: false, reason: "product_not_found", existingReview: null },
    });
  }

  const activeReview = findActiveReview(req.user._id, productId, reviews);
  if (activeReview) {
    return res.json({
      success: true,
      data: {
        eligible: true,
        reason: null,
        existingReview: toAuthorReview(activeReview),
      },
    });
  }

  const eligible = isVerifiedPurchaser(req.user._id, productId, orders);
  if (!eligible) {
    console.log(
      JSON.stringify({
        event: "review_eligibility_denied",
        userId: req.user._id,
        productId,
        reason: "not_verified_purchaser",
      })
    );
    return res.json({
      success: true,
      data: {
        eligible: false,
        reason: "not_verified_purchaser",
        existingReview: null,
      },
    });
  }

  res.json({
    success: true,
    data: { eligible: true, reason: null, existingReview: null },
  });
});

// POST /products/:productId/reviews  (auth required)
app.post("/products/:productId/reviews", authMiddleware, (req, res) => {
  const { productId } = req.params;
  const product = products.find((p) => p._id === productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const { rating, text } = req.body;
  const ratingNum = parseInt(rating, 10);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ success: false, message: "Invalid rating" });
  }
  const reviewText = text ? String(text).trim().substring(0, 500) : "";

  if (!isVerifiedPurchaser(req.user._id, productId, orders)) {
    console.log(
      JSON.stringify({
        event: "review_eligibility_denied",
        userId: req.user._id,
        productId,
        reason: "not_verified_purchaser",
      })
    );
    return res.status(403).json({
      success: false,
      message: "Only verified purchasers can review this product",
    });
  }

  const existing = findActiveReview(req.user._id, productId, reviews);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "Review already exists; use PUT to update",
    });
  }

  const now = new Date().toISOString();
  const newReview = {
    _id: uuidv4(),
    productId,
    userId: req.user._id,
    user: { _id: req.user._id, name: req.user.name },
    rating: ratingNum,
    text: reviewText,
    verifiedPurchase: true,
    visibility: "published",
    createdAt: now,
    updatedAt: now,
  };
  reviews.push(newReview);

  console.log(
    JSON.stringify({
      event: "review_created",
      reviewId: newReview._id,
      userId: req.user._id,
      productId,
      rating: ratingNum,
    })
  );

  res.status(201).json({
    success: true,
    message: "Review submitted",
    data: newReview,
  });
});

// PUT /products/:productId/reviews  (auth required)
app.put("/products/:productId/reviews", authMiddleware, (req, res) => {
  const { productId } = req.params;
  const existing = findActiveReview(req.user._id, productId, reviews);
  if (!existing) {
    return res.status(404).json({ success: false, message: "No active review to update" });
  }
  if (existing.userId !== req.user._id) {
    return res.status(403).json({ success: false, message: "Not authorized to update this review" });
  }

  const { rating, text } = req.body;
  const ratingNum = parseInt(rating, 10);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ success: false, message: "Invalid rating" });
  }

  existing.rating = ratingNum;
  existing.text = text ? String(text).trim().substring(0, 500) : "";
  existing.updatedAt = new Date().toISOString();

  console.log(
    JSON.stringify({
      event: "review_updated",
      reviewId: existing._id,
      userId: req.user._id,
      productId,
      rating: ratingNum,
    })
  );

  res.json({
    success: true,
    message: "Review updated",
    data: existing,
  });
});

// GET /admin/reviews  (admin)
app.get("/admin/reviews", adminMiddleware, (req, res) => {
  const { productId, visibility } = req.query;
  let filtered = [...reviews];
  if (productId) {
    filtered = filtered.filter((r) => r.productId === productId);
  }
  if (visibility) {
    filtered = filtered.filter((r) => r.visibility === visibility);
  }

  const data = filtered
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map((review) => {
      const product = products.find((p) => p._id === review.productId);
      return {
        _id: review._id,
        productId: review.productId,
        productTitle: product ? product.title : "Unknown Product",
        user: review.user,
        rating: review.rating,
        text: review.text,
        verifiedPurchase: review.verifiedPurchase,
        visibility: review.visibility,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };
    });

  res.json({ success: true, data });
});

// PATCH /admin/reviews/:reviewId/visibility  (admin)
app.patch("/admin/reviews/:reviewId/visibility", adminMiddleware, (req, res) => {
  const { reviewId } = req.params;
  const { visibility } = req.body;
  const validVisibilities = ["published", "hidden", "removed"];
  if (!validVisibilities.includes(visibility)) {
    return res.status(400).json({ success: false, message: "Invalid visibility" });
  }

  const review = reviews.find((r) => r._id === reviewId);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  review.visibility = visibility;
  review.updatedAt = new Date().toISOString();

  console.log(
    JSON.stringify({
      event: "review_visibility_changed",
      reviewId: review._id,
      adminId: req.user._id,
      visibility,
    })
  );

  res.json({
    success: true,
    message: `Review visibility updated to ${visibility}`,
    data: review,
  });
});

// POST /photos/upload
app.post("/photos/upload", upload.single("photos"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  res.json({
    success: true,
    message: "Image uploaded successfully",
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
  });
});

// ─── Fallback placeholder image for /uploads/* ────────────────────────────────
// Returns a simple SVG placeholder when the requested image doesn't exist
app.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  const fs = require("fs");
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  // Return a simple SVG placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="200" height="200" fill="#e0e0e0"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial" font-size="14" fill="#999">No Image</text>
  </svg>`;
  res.setHeader("Content-Type", "image/svg+xml");
  res.send(svg);
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 EasyBuy Mock Server running at http://localhost:${PORT}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   POST   /register`);
  console.log(`   POST   /login`);
  console.log(`   GET    /products`);
  console.log(`   GET    /products/lookup?code=`);
  console.log(`   POST   /product              (admin)`);
  console.log(`   POST   /update-product?id=   (admin)`);
  console.log(`   GET    /delete-product?id=   (admin)`);
  console.log(`   GET    /categories`);
  console.log(`   POST   /category             (admin)`);
  console.log(`   POST   /update-category?id=  (admin)`);
  console.log(`   GET    /delete-category?id=  (admin)`);
  console.log(`   GET    /dashboard            (admin)`);
  console.log(`   GET    /admin/orders         (admin)`);
  console.log(`   GET    /admin/users          (admin)`);
  console.log(`   GET    /admin/order-status?orderId=&status=  (admin)`);
  console.log(`   GET    /orders               (user)`);
  console.log(`   POST   /checkout             (user)`);
  console.log(`   GET    /delete-user?id=`);
  console.log(`   POST   /reset-password?id=`);
  console.log(`   GET    /products/:productId/reviews`);
  console.log(`   GET    /products/:productId/reviews/eligibility`);
  console.log(`   POST   /products/:productId/reviews`);
  console.log(`   PUT    /products/:productId/reviews`);
  console.log(`   GET    /admin/reviews            (admin)`);
  console.log(`   PATCH  /admin/reviews/:reviewId/visibility  (admin)`);
  console.log(`   POST   /photos/upload`);
  console.log(`   GET    /uploads/:filename`);
  console.log(`\n🔑 Test tokens:`);
  console.log(`   Admin token : mock-admin-token-001`);
  console.log(`   User token  : mock-user-token-001`);
  console.log(`\n👤 Test credentials:`);
  console.log(`   Admin  → email: admin@easybuy.com  | password: admin123`);
  console.log(`   User   → email: user@easybuy.com   | password: user123\n`);
});

// Made with Bob
