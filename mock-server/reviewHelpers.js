function isVerifiedPurchaser(userId, productId, orders) {
  return orders.some(
    (order) =>
      order.user._id === userId &&
      order.status === "delivered" &&
      order.items.some((item) => item.productId._id === productId)
  );
}

function findActiveReview(userId, productId, reviews) {
  return (
    reviews.find(
      (review) =>
        review.userId === userId &&
        review.productId === productId &&
        review.visibility !== "removed"
    ) || null
  );
}

function computeSummary(productId, reviews) {
  const published = reviews.filter(
    (review) =>
      review.productId === productId && review.visibility === "published"
  );
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  published.forEach((review) => {
    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    sum += review.rating;
  });
  const totalCount = published.length;
  const averageRating =
    totalCount > 0 ? Math.round((sum / totalCount) * 10) / 10 : 0;
  return { averageRating, totalCount, distribution };
}

function toPublicReview(review) {
  return {
    _id: review._id,
    productId: review.productId,
    user: review.user,
    rating: review.rating,
    text: review.text,
    verifiedPurchase: true,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function toAuthorReview(review) {
  return {
    ...toPublicReview(review),
    visibility: review.visibility,
  };
}

module.exports = {
  isVerifiedPurchaser,
  findActiveReview,
  computeSummary,
  toPublicReview,
  toAuthorReview,
};
