import {
  getProductReviews,
  getEligibility,
  createReview,
  updateReview,
  getAdminReviews,
  patchReviewVisibility,
} from "../services/reviews";

jest.mock("../constants", () => ({
  network: { serverip: "http://localhost:3002" },
}));

describe("reviewsService", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("getProductReviews parses success response", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          summary: { averageRating: 4.2, totalCount: 1, distribution: { 5: 1 } },
          reviews: [{ _id: "rev-1", rating: 5 }],
        },
      }),
    });

    const { ok, status, result } = await getProductReviews("prod007");
    expect(ok).toBe(true);
    expect(status).toBe(200);
    expect(result.data.summary.averageRating).toBe(4.2);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3002/products/prod007/reviews?limit=10",
      { method: "GET", headers: {} }
    );
  });

  it("getEligibility sends auth token", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { eligible: true, reason: null, existingReview: null },
      }),
    });

    const { result } = await getEligibility("prod007", "mock-token");
    expect(result.data.eligible).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3002/products/prod007/reviews/eligibility",
      expect.objectContaining({
        headers: { "x-auth-token": "mock-token" },
      })
    );
  });

  it("createReview posts rating and text", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ success: true, message: "Review submitted" }),
    });

    await createReview("prod007", { rating: 5, text: "Great" }, "token");
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3002/products/prod007/reviews",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ rating: 5, text: "Great" }),
      })
    );
  });

  it("updateReview uses PUT", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: "Review updated" }),
    });

    await updateReview("prod007", { rating: 4, text: "Updated" }, "token");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/products/prod007/reviews"),
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("getAdminReviews supports query params", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    });

    await getAdminReviews("admin-token", { productId: "prod007", visibility: "hidden" });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3002/admin/reviews?productId=prod007&visibility=hidden",
      expect.any(Object)
    );
  });

  it("patchReviewVisibility patches visibility", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await patchReviewVisibility("rev-1", { visibility: "hidden" }, "admin-token");
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3002/admin/reviews/rev-1/visibility",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ visibility: "hidden" }),
      })
    );
  });
});
