const {
  isVerifiedPurchaser,
  findActiveReview,
  computeSummary,
  toPublicReview,
  toAuthorReview,
} = require("../mock-server/reviewHelpers");

const sampleOrders = [
  {
    _id: "order001",
    user: { _id: "user001" },
    status: "pending",
    items: [{ productId: { _id: "prod007" } }],
  },
  {
    _id: "order003",
    user: { _id: "user001" },
    status: "delivered",
    items: [{ productId: { _id: "prod007" } }],
  },
  {
    _id: "order002",
    user: { _id: "user002" },
    status: "shipped",
    items: [{ productId: { _id: "prod005" } }],
  },
];

const sampleReviews = [
  {
    _id: "rev-001",
    productId: "prod007",
    userId: "user001",
    user: { _id: "user001", name: "John Doe" },
    rating: 5,
    text: "Great!",
    verifiedPurchase: true,
    visibility: "published",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "rev-002",
    productId: "prod007",
    userId: "user002",
    user: { _id: "user002", name: "Jane" },
    rating: 3,
    text: "Okay",
    verifiedPurchase: true,
    visibility: "hidden",
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
  {
    _id: "rev-003",
    productId: "prod007",
    userId: "user003",
    user: { _id: "user003", name: "Bob" },
    rating: 1,
    text: "Bad",
    verifiedPurchase: true,
    visibility: "removed",
    createdAt: "2024-01-03T00:00:00.000Z",
    updatedAt: "2024-01-03T00:00:00.000Z",
  },
];

describe("isVerifiedPurchaser", () => {
  it("returns false for pending orders", () => {
    expect(isVerifiedPurchaser("user001", "prod001", sampleOrders)).toBe(false);
  });

  it("returns true for delivered orders containing product", () => {
    expect(isVerifiedPurchaser("user001", "prod007", sampleOrders)).toBe(true);
  });

  it("returns false for shipped but not delivered", () => {
    expect(isVerifiedPurchaser("user002", "prod005", sampleOrders)).toBe(false);
  });
});

describe("findActiveReview", () => {
  it("finds non-removed review for user and product", () => {
    const review = findActiveReview("user001", "prod007", sampleReviews);
    expect(review._id).toBe("rev-001");
  });

  it("finds hidden review as active", () => {
    const review = findActiveReview("user002", "prod007", sampleReviews);
    expect(review._id).toBe("rev-002");
  });

  it("returns null for removed review", () => {
    expect(findActiveReview("user003", "prod007", sampleReviews)).toBeNull();
  });
});

describe("computeSummary", () => {
  it("excludes hidden and removed from summary", () => {
    const summary = computeSummary("prod007", sampleReviews);
    expect(summary.totalCount).toBe(1);
    expect(summary.averageRating).toBe(5);
    expect(summary.distribution[5]).toBe(1);
    expect(summary.distribution[3]).toBe(0);
  });

  it("returns zeroed summary when no published reviews", () => {
    const summary = computeSummary("prod999", sampleReviews);
    expect(summary.totalCount).toBe(0);
    expect(summary.averageRating).toBe(0);
  });
});

describe("toPublicReview", () => {
  it("always includes verifiedPurchase true", () => {
    const pub = toPublicReview(sampleReviews[0]);
    expect(pub.verifiedPurchase).toBe(true);
    expect(pub.visibility).toBeUndefined();
  });
});

describe("toAuthorReview", () => {
  it("includes visibility for author view", () => {
    const author = toAuthorReview(sampleReviews[1]);
    expect(author.visibility).toBe("hidden");
    expect(author.verifiedPurchase).toBe(true);
  });
});
