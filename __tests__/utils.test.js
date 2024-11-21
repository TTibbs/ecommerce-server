const {
  convertTimestampToDate,
  createProductRef,
  formatReviewData,
} = require("../db/seeds/utils.js");

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1672531200000;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1672531200000;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1672531200000;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("includes other key-value pairs in returned object", () => {
    const input = { created_at: 0, rating: 5, review_text: "Great product!" };
    const result = convertTimestampToDate(input);
    expect(result.rating).toBe(5);
    expect(result.review_text).toBe("Great product!");
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});

describe("createProductRef", () => {
  test("returns an empty object when passed an empty array", () => {
    const input = [];
    const actual = createProductRef(input);
    const expected = {};
    expect(actual).toEqual(expected);
  });
  test("returns a reference object when passed an array with a single item", () => {
    const input = [
      { name: "MacBook Pro", product_id: 1, category: "Electronics" },
    ];
    let actual = createProductRef(input, "name", "product_id");
    let expected = { "MacBook Pro": 1 };
    expect(actual).toEqual(expected);
    actual = createProductRef(input, "category", "name");
    expected = { Electronics: "MacBook Pro" };
    expect(actual).toEqual(expected);
  });
  test("returns a reference object when passed an array with multiple items", () => {
    const input = [
      { name: "MacBook Pro", product_id: 1 },
      { name: "Gaming Chair", product_id: 2 },
      { name: "Wireless Mouse", product_id: 3 },
    ];
    const actual = createProductRef(input, "name", "product_id");
    const expected = {
      "MacBook Pro": 1,
      "Gaming Chair": 2,
      "Wireless Mouse": 3,
    };
    expect(actual).toEqual(expected);
  });
  test("does not mutate the input", () => {
    const input = [{ name: "MacBook Pro", product_id: 1 }];
    const control = [{ name: "MacBook Pro", product_id: 1 }];
    createProductRef(input);
    expect(input).toEqual(control);
  });
});

describe("formatReviewData", () => {
  test("converts created_at timestamp to a date", () => {
    const timestamp = Date.now();
    const productRef = { "MacBook Pro": 1 };
    const reviews = [
      { product_name: "MacBook Pro", created_at: timestamp, rating: 5 },
    ];
    const formattedReviews = formatReviewData(reviews, productRef);
    expect(formattedReviews[0].created_at).toEqual(new Date(timestamp));
    expect(formattedReviews[0]).toHaveProperty("product_id", 1);
    expect(formattedReviews[0]).not.toHaveProperty("product_name");
  });
  test("maps product names to product_ids in the review data", () => {
    const productRef = { "MacBook Pro": 1, "Gaming Chair": 2 };
    const reviews = [
      { product_name: "MacBook Pro", rating: 5, created_at: Date.now() },
    ];
    const formattedReviews = formatReviewData(reviews, productRef);
    expect(formattedReviews[0]).toHaveProperty("product_id", 1);
    expect(formattedReviews[0]).not.toHaveProperty("product_name");
  });
  test("does not mutate the original reviews array", () => {
    const productRef = { "MacBook Pro": 1 };
    const reviews = [
      { product_name: "MacBook Pro", rating: 5, created_at: Date.now() },
    ];
    const control = [...reviews];
    formatReviewData(reviews, productRef);
    expect(reviews).toEqual(control);
  });
});
