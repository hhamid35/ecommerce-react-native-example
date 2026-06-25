import { network } from "../constants";

async function parseResponse(response) {
  const result = await response.json();
  return { ok: response.ok, status: response.status, result };
}

export async function getProductReviews(productId, { limit = 10, token } = {}) {
  const headers = {};
  if (token) {
    headers["x-auth-token"] = token;
  }
  const response = await fetch(
    `${network.serverip}/products/${productId}/reviews?limit=${limit}`,
    { method: "GET", headers }
  );
  return parseResponse(response);
}

export async function getEligibility(productId, token) {
  const response = await fetch(
    `${network.serverip}/products/${productId}/reviews/eligibility`,
    {
      method: "GET",
      headers: { "x-auth-token": token },
    }
  );
  return parseResponse(response);
}

export async function createReview(productId, { rating, text }, token) {
  const response = await fetch(
    `${network.serverip}/products/${productId}/reviews`,
    {
      method: "POST",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating, text }),
    }
  );
  return parseResponse(response);
}

export async function updateReview(productId, { rating, text }, token) {
  const response = await fetch(
    `${network.serverip}/products/${productId}/reviews`,
    {
      method: "PUT",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating, text }),
    }
  );
  return parseResponse(response);
}

export async function getAdminReviews(token, { productId, visibility } = {}) {
  const params = new URLSearchParams();
  if (productId) params.append("productId", productId);
  if (visibility) params.append("visibility", visibility);
  const query = params.toString();
  const url = `${network.serverip}/admin/reviews${query ? `?${query}` : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { "x-auth-token": token },
  });
  return parseResponse(response);
}

export async function patchReviewVisibility(reviewId, { visibility }, token) {
  const response = await fetch(
    `${network.serverip}/admin/reviews/${reviewId}/visibility`,
    {
      method: "PATCH",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ visibility }),
    }
  );
  return parseResponse(response);
}
