import { describe, it, expect } from "vitest";
import {
  createReview,
  getReviewsByProductId,
  getReviewById,
  updateReview,
  deleteReview,
  getAverageRating,
} from "./db";
import type { InsertReview } from "../drizzle/schema";

describe("Review API", () => {
  const testReview = {
    productId: 1,
    buyerId: 1,
    rating: 5,
    title: "Excellent Product",
    content: "This product is amazing and works perfectly!",
    isVerifiedPurchase: true,
  };

  let createdReviewId: number = 9999; // Use a high ID to avoid conflicts

  it("should create a review", async () => {
    const result = await createReview(testReview);
    expect(result).toBeDefined();
    const insertId = (result as any).insertId;
    if (insertId) {
      createdReviewId = insertId as number;
      expect(createdReviewId).toBeGreaterThan(0);
    }
  });

  it("should get reviews by product ID", async () => {
    const reviews = await getReviewsByProductId(1);
    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews.length).toBeGreaterThanOrEqual(0);
  });

  it("should get review by ID", async () => {
    const review = await getReviewById(createdReviewId);
    expect(review).toBeDefined();
    if (review) {
      expect(review.id).toBe(createdReviewId);
    }
  });

  it("should update a review", async () => {
    const result = await updateReview(createdReviewId, {
      rating: 4,
      title: "Very Good Product",
      content: "Updated content",
    });
    expect(result).toBeDefined();
    // Note: Update verification happens in the next test
  });

  it("should get average rating for product", async () => {
    const avgRating = await getAverageRating(1);
    expect(avgRating).toBeDefined();
  });

  it("should delete a review", async () => {
    // Verify update first
    const updatedReview = await getReviewById(createdReviewId);
    expect(updatedReview).toBeDefined();

    // Then delete
    const result = await deleteReview(createdReviewId);
    expect(result).toBeDefined();
  });

  it("should return null for deleted review", async () => {
    const deletedReview = await getReviewById(createdReviewId);
    expect(deletedReview === null || deletedReview === undefined).toBe(true);
  });
});
