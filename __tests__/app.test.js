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
  test("Should return a list of available endpoints", async () => {
    const response = await request(app).get("/api").expect(200);
    const { endpoints } = response.body;
    expect(endpointsCheck).toEqual(endpoints);
    expect(typeof endpoints).toBe("object");
  });
});

describe("GET: /api/products", () => {
  test("Should return an array of products", async () => {
    const response = await request(app).get("/api/products").expect(200);
    const { products } = response.body;
    products.forEach((product) => {
      expect(product).toHaveProperty("product_id", expect.any(Number));
      expect(product).toHaveProperty("name", expect.any(String));
      expect(product).toHaveProperty("price", expect.any(String));
      expect(product).toHaveProperty("description", expect.any(String));
      expect(product).toHaveProperty("stock", expect.any(Number));
      expect(product).toHaveProperty("category", expect.any(Number));
      expect(products.length).toBeGreaterThan(0);
    });
  });
  describe("GET: /api/products/:product_id", () => {
    describe("GET: 200", () => {
      test("Should return the product relative to its ID", async () => {
        const response = await request(app).get("/api/products/1").expect(200);
        const { product } = response.body;
        expect(product.name).toBe("MacBook Pro M4 14in");
        expect(product.price).toBe("1599.99");
        expect(product.description).toBe(
          "High-performance laptop with 16GB RAM and 256GB SSD."
        );
        expect(product.stock).toBe(50);
        expect(product.category).toBe(1);
      });
    });
    describe("GET ERRORS", () => {
      test("400 status check", async () => {
        const response = await request(app)
          .get("/api/products/notanumber")
          .expect(400);
        const { msg } = response.body;
        expect(msg).toBe("Invalid product id");
      });
      test("404 status check", async () => {
        const response = await request(app)
          .get("/api/products/9999")
          .expect(404);
        const { msg } = response.body;
        expect(msg).toBe("Product not found");
      });
    });
  });
  describe("GET: /api/products/:product:id/reviews", () => {
    describe("GET: 200", () => {
      test("Should return an array of review objects relative to product id", async () => {
        const response = await request(app)
          .get("/api/products/1/reviews")
          .expect(200);
        const { reviews } = response.body;
        reviews.forEach((review) => {
          expect(review).toHaveProperty("review_id", expect.any(Number));
          expect(review).toHaveProperty("product_id", expect.any(Number));
          expect(review).toHaveProperty("user_id", expect.any(Number));
          expect(review).toHaveProperty("rating", expect.any(Number));
          expect(review).toHaveProperty("review_text", expect.any(String));
        });
      });
    });
    describe("GET ERRORS", () => {
      test("Should return a 400 status and a error message when the ID param is invalid", async () => {
        const response = await request(app)
          .get("/api/products/notanumber/reviews")
          .expect(400);
        const { msg } = response.body;
        expect(msg).toBe("Invalid product id");
      });
      test("Should return a 404 status and a error message when the ID is non-existent", async () => {
        const response = await request(app)
          .get("/api/products/900/reviews")
          .expect(404);
        const { msg } = response.body;
        expect(msg).toBe("Product not found");
      });
    });
  });
});

describe("GET: /api/orders", () => {
  test("Should return an array of order objects", async () => {
    const response = await request(app).get("/api/orders").expect(200);
    const { orders } = response.body;
    orders.forEach((order) => {
      expect(order).toHaveProperty("user_id", expect.any(Number));
      expect(order).toHaveProperty("total", expect.any(String));
      expect(order).toHaveProperty("created_at", expect.any(String));
    });
  });
  describe("GET: /api/orders/:order_id", () => {
    test("Should return an order relative to its ID", async () => {
      const response = await request(app).get("/api/orders/1").expect(200);
      const { order } = response.body;
      expect(order).toHaveProperty("order_id", expect.any(Number));
      expect(order).toHaveProperty("user_id", expect.any(Number));
      expect(order).toHaveProperty("total", expect.any(String));
      expect(order).toHaveProperty("created_at", expect.any(String));
    });
    describe("GET ERRORS", () => {
      describe("GET 400", () => {
        test("Should return a 400 status and error message if ID is invalid", async () => {
          const response = await request(app)
            .get("/api/orders/notvalidid")
            .expect(400);
          const { msg } = response.body;
          expect(msg).toBe("Invalid order ID");
        });
      });
      describe("GET 404", () => {
        test("Should return a 404 status and error message if ID is invalid", async () => {
          const response = await request(app)
            .get("/api/orders/1000")
            .expect(404);
          const { msg } = response.body;
          expect(msg).toBe("Order does not exist");
        });
      });
    });
  });
  describe("POST: /api/orders", () => {
    describe("POST 200", () => {
      test("Should successfully post a new order", async () => {
        const orderToAdd = {
          user_id: 1,
          total: 420.0,
        };
        const response = await request(app)
          .post("/api/orders")
          .send(orderToAdd)
          .expect(201);
        const { newOrder } = response.body;
        expect(newOrder).toHaveProperty("user_id", expect.any(Number));
        expect(newOrder).toHaveProperty("order_id", expect.any(Number));
        expect(newOrder).toHaveProperty("total", expect.any(String));
        expect(newOrder).toHaveProperty("created_at", expect.any(String));
      });
    });
    describe("POST 400", () => {
      test("Should return a 400 status and an error message if the order has missing fields", async () => {
        const orderToAdd = {
          user_id: 1,
        };
        const response = await request(app)
          .post("/api/orders")
          .send(orderToAdd)
          .expect(400);
        const { msg } = response.body;
        expect(msg).toBe("Invalid or missing total. It must be a number.");
      });
      test("Should return a 400 status and an error message if the order total has invalid fields", async () => {
        const orderToAdd = {
          user_id: 1,
          total: "420.00",
        };
        const response = await request(app)
          .post("/api/orders")
          .send(orderToAdd)
          .expect(400);
        const { msg } = response.body;
        expect(msg).toBe("Invalid or missing total. It must be a number.");
      });
      test("Should return a 400 status and an error message if the order user id has invalid fields", async () => {
        const orderToAdd = {
          user_id: "1",
          total: 420.0,
        };
        const response = await request(app)
          .post("/api/orders")
          .send(orderToAdd)
          .expect(400);
        const { msg } = response.body;
        expect(msg).toBe("Invalid or missing user ID. It must be a number.");
      });
    });
  });
  describe("PATCH: /api/orders/:order_id", () => {
    test("Should successfully update a order by its ID", async () => {
      const patchedOrder = {
        user_id: 1,
        order_id: 1,
        total: 42.0,
      };
      const response = await request(app)
        .patch("/api/orders/1")
        .send(patchedOrder)
        .expect(200);
      const { updatedOrder } = response.body;
      expect(updatedOrder).toHaveProperty("user_id", expect.any(Number));
      expect(updatedOrder).toHaveProperty("order_id", expect.any(Number));
      expect(updatedOrder).toHaveProperty("total", expect.any(Number));
      expect(updatedOrder).toHaveProperty("created_at", expect.any(String));
    });
    describe("PATCH 400", () => {
      test("Should return a 400 status code and error message if product patch has nothing to send", async () => {
        const response = await request(app)
          .patch("/api/orders/1")
          .send()
          .expect(400);
        const { msg } = response.body;
        expect(msg).toBe("No valid updates provided");
      });
    });
  });
});

describe("GET: /api/reviews", () => {
  test("Should return an array or review object", async () => {
    const response = await request(app).get("/api/reviews").expect(200);
    const { reviews } = response.body;
    reviews.forEach((review) => {
      expect(review).toHaveProperty("product_id", expect.any(Number));
      expect(review).toHaveProperty("user_id", expect.any(Number));
      expect(review).toHaveProperty("rating", expect.any(Number));
      expect(review).toHaveProperty("review_text", expect.any(String));
    });
  });
});

describe("POST: /api/products", () => {
  describe("POST: 201", () => {
    test("Should successfully post a new product", async () => {
      const newProduct = {
        name: "Playstation 5 disc edition",
        price: 349.99,
        description: "Gaming console",
        stock: 12,
        category: 1,
      };
      const response = await request(app)
        .post("/api/products")
        .send(newProduct)
        .expect(201);
      const { product } = response.body;
      expect(product).toHaveProperty("product_id", 11);
      expect(product).toHaveProperty("name", "Playstation 5 disc edition");
      expect(product).toHaveProperty("price", "349.99");
      expect(product).toHaveProperty("description", "Gaming console");
      expect(product).toHaveProperty("stock", 12);
      expect(product).toHaveProperty("category", 1);
    });
  });
  describe("POST: 400", () => {
    test("Should return a 400 status and a error message if the new product has missing values", async () => {
      const incompleteProduct = {
        name: "Bad post",
        stock: 42,
        category: 2,
      };
      const response = await request(app)
        .post("/api/products")
        .send(incompleteProduct)
        .expect(400);
      const { msg } = response.body;
      expect(msg).toBe("Bad request: Missing required fields");
    });
  });
});

describe("POST: /api/products/:product_id/reviews", () => {
  describe("POST: 201", () => {
    test("Should successfully post a review to the relative product id", async () => {
      const productReview = {
        rating: 5,
        review_text: "Awesome",
        user_id: 1,
      };
      const response = await request(app)
        .post("/api/products/1/reviews")
        .send(productReview)
        .expect(201);
      const { newProductReview } = response.body;
      expect(newProductReview).toHaveProperty("product_id", 1);
      expect(newProductReview).toHaveProperty("user_id", 1);
      expect(newProductReview).toHaveProperty("rating", 5);
      expect(newProductReview).toHaveProperty("review_text", "Awesome");
      expect(newProductReview).toHaveProperty("created_at", expect.any(String));
    });
  });
  describe("POST ERRORS", () => {
    test("Should return 400 status and a error message if the new review has missing values", async () => {
      const productReview = {
        review_text: "Awesome",
        user_id: 1,
      };
      const response = await request(app)
        .post("/api/products/1/reviews")
        .send(productReview)
        .expect(400);
      const { msg } = response.body;
      expect(msg).toBe("Bad request: Missing required fields");
    });
    test("Should return 400 if required fields are missing", async () => {
      const productReview = {
        review_text: "No rating provided",
        user_id: 1,
      };
      const response = await request(app)
        .post("/api/products/1/reviews")
        .send(productReview)
        .expect(400);
      const { msg } = response.body;
      expect(msg).toBe("Bad request: Missing required fields");
    });
    test("Should return 404 status and an error message if the new review is posted to non-existant product id", async () => {
      const productReview = {
        rating: 5,
        review_text: "Awesome",
        user_id: 1,
      };
      const response = await request(app)
        .post("/api/products/1000/reviews")
        .send(productReview)
        .expect(404);
      const { msg } = response.body;
      expect(msg).toBe("Product not found");
    });
  });
});

describe("PATCH: /api/products/:product_id", () => {
  describe("PATCH 200", () => {
    test("Should successfully patch the product with the ID given", async () => {
      const patchedProduct = {
        price: 299.99,
      };
      const response = await request(app)
        .patch("/api/products/1")
        .send(patchedProduct)
        .expect(200);
      const { updatedProduct } = response.body;
      expect(updatedProduct.price).toBe("299.99");
    });
    test("Should successfully patch the product with the ID given", async () => {
      const patchedProduct = {
        price: 299.99,
        stock: 50,
      };
      const response = await request(app)
        .patch("/api/products/1")
        .send(patchedProduct)
        .expect(200);
      const { updatedProduct } = response.body;
      expect(updatedProduct.price).toBe("299.99");
    });
  });
  describe("PATCH 400", () => {
    test("Should return a 400 status code and error message if product patch has nothing to send", async () => {
      const response = await request(app)
        .patch("/api/products/1")
        .send()
        .expect(400);
      const { msg } = response.body;
      expect(msg).toBe("No updates provided");
    });
    test("Should return a 400 status code and error message if product patch has invalid fields", async () => {
      const patchedProduct = {
        invalid_field: 299.99,
        stock: 50,
      };
      const response = await request(app)
        .patch("/api/products/1")
        .send(patchedProduct)
        .expect(400);
      const { msg } = response.body;
      expect(msg).toBe("Invalid fields provided");
    });
  });
  describe("PATCH: 404", () => {
    test("Should return a 404 status code and error message if product is non-existent", async () => {
      const patchedProduct = {
        price: 299.99,
        stock: 50,
      };
      const response = await request(app)
        .patch("/api/products/1000")
        .send(patchedProduct)
        .expect(404);
      const { msg } = response.body;
      expect(msg).toBe("Product not found");
    });
  });
});

describe("DELETE: /api/products/:product_id", () => {
  test("Should delete a product by its ID", async () => {
    const response = await request(app)
      .delete("/api/products/1")
      .send()
      .expect(204);
  });
  test("Should return a 400 status code if the product ID is invalid", async () => {
    const response = await request(app)
      .delete("/api/products/notvalidid")
      .send()
      .expect(400);
  });
  test("Should return a 400 status code if the product ID is invalid", async () => {
    const response = await request(app)
      .delete("/api/products/100")
      .send()
      .expect(404);
  });
});
