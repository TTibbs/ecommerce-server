const app = require("../src/app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const endpointsCheck = require("../src/endpoints.json");
// require("jest-sorted");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET: /api", () => {
  test("Should return a list of available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpointsCheck).toEqual(endpoints);
        expect(typeof endpoints).toBe("object");
      });
  });
});

describe("GET: /api/products", () => {
  test("Should return an array of products", () => {
    return request(app)
      .get("/api/products")
      .expect(200)
      .then(({ body: { products } }) => {
        products.forEach((product) => {
          expect(product).toHaveProperty("product_id", expect.any(Number));
          expect(product).toHaveProperty("name", expect.any(String));
          expect(product).toHaveProperty("price", expect.any(String));
          expect(product).toHaveProperty("description", expect.any(String));
          expect(product).toHaveProperty("stock", expect.any(Number));
          expect(product).toHaveProperty("category", expect.any(Number));
        });
      });
  });
});

describe("GET: /api/products/:product_id", () => {
  describe("Successful GETs", () => {
    test("Should return an array of products", () => {
      return request(app)
        .get("/api/products/1")
        .expect(200)
        .then(({ body: { product } }) => {
          expect(product.name).toBe("MacBook Pro M4 14in");
          expect(product.price).toBe("1599.99");
          expect(product.description).toBe(
            "High-performance laptop with 16GB RAM and 256GB SSD."
          );
          expect(product.stock).toBe(50);
          expect(product.category).toBe(1);
        });
    });
  });
  describe("Unsuccessful GETs", () => {
    test("400 status check", () => {
      return request(app)
        .get("/api/products/notanumber")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid product id");
        });
    });
    test("404 status check", () => {
      return request(app)
        .get("/api/products/9999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Product not found");
        });
    });
  });
});

describe("GET: /api/products/:product:id/reviews", () => {
  describe("Successful GETs", () => {
    test("Should return an array of review objects relative to product id", () => {
      return request(app)
        .get("/api/products/1/reviews")
        .expect(200)
        .then(({ body: { reviews } }) => {
          reviews.forEach((review) => {
            expect(review).toHaveProperty("review_id", expect.any(Number));
            expect(review).toHaveProperty("product_id", expect.any(Number));
            expect(review).toHaveProperty("user_id", expect.any(Number));
            expect(review).toHaveProperty("rating", expect.any(Number));
            expect(review).toHaveProperty("review_text", expect.any(String));
            expect(review).toHaveProperty("created_at", expect.any(String));
          });
        });
    });
  });
  describe("Unsuccessful GETs", () => {
    test("400 status check", () => {
      return request(app)
        .get("/api/products/notanumber/reviews")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid product id");
        });
    });
  });
});

describe("POST REQUESTS - /api/products", () => {
  describe("POST: 200", () => {
    test("Should successfully post a new product", () => {
      const newProduct = {
        name: "Playstation 5 disc edition",
        price: 349.99,
        description: "Gaming console",
        stock: 12,
        category: 1,
      };
      return request(app)
        .post("/api/products")
        .send(newProduct)
        .expect(201)
        .then(({ body: { product } }) => {
          expect(product).toHaveProperty("product_id", 11);
          expect(product).toHaveProperty("name", "Playstation 5 disc edition");
          expect(product).toHaveProperty("price", "349.99");
          expect(product).toHaveProperty("description", "Gaming console");
          expect(product).toHaveProperty("stock", 12);
          expect(product).toHaveProperty("category", 1);
        });
    });
  });
  describe("POST: 400", () => {
    test("Should return an error message if the new product has missing values", () => {
      const incompleteProduct = {
        name: "Bad post",
        stock: 42,
        category: 2,
      };
      return request(app)
        .post("/api/products")
        .send(incompleteProduct)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request: Missing required fields");
        });
    });
  });
});
