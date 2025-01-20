const app = require("../src/app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const endpointsCheck = require("../src/endpoints.json");
require("jest-sorted");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET REQUESTS", () => {
  describe("GET: /api", () => {
    test("Should return a list of available endpoints", async () => {
      const response = await request(app).get("/api").expect(200);
      const { endpoints } = response.body;
      expect(endpointsCheck).toEqual(endpoints);
      expect(typeof endpoints).toBe("object");
    });
  });

  describe("GET: /api/categories", () => {
    test("Should return an array of product categories", async () => {
      const response = await request(app).get("/api/categories").expect(200);
      const { categories } = response.body;
      categories.forEach((category) => {
        expect(category).toHaveProperty("category_id", expect.any(Number));
        expect(category).toHaveProperty("category_name", expect.any(String));
      });
    });
    describe("GET: /api/categories/:category_id", () => {
      test("Should return a category info by its ID", async () => {
        const response = await request(app)
          .get("/api/categories/1")
          .expect(200);
        const { category } = response.body;
        expect(category.category_id).toBe(1);
        expect(category.category_name).toBe("Laptops");
      });
      describe("GET 400 & 404", () => {
        test("Should return a 400 status and error message if the category ID is invalid", async () => {
          const response = await request(app)
            .get("/api/categories/notavalidid")
            .expect(400);
          const { msg } = response.body;
          expect(msg).toBe("Bad request: Invalid category ID");
        });
        test("Should return a 404 status and error message if the category ID is non-existent", async () => {
          const response = await request(app)
            .get("/api/categories/9999")
            .expect(404);
          const { msg } = response.body;
          expect(msg).toBe("Category not found");
        });
      });
    });
  });

  describe("GET: /api/products", () => {
    test("Should return an array of products", async () => {
      const response = await request(app).get("/api/products").expect(200);
      const { products } = response.body;
      expect(products.length).toBeGreaterThan(0);
      products.forEach((product) => {
        expect(product).toHaveProperty("product_id", expect.any(Number));
        expect(product).toHaveProperty("product_name", expect.any(String));
        expect(product).toHaveProperty("price", expect.any(Number));
        expect(product).toHaveProperty("description", expect.any(String));
        expect(product).toHaveProperty("stock", expect.any(Number));
        expect(product).toHaveProperty("category", expect.any(Number));
        expect(product).toHaveProperty("image_url", expect.any(String));
      });
    });
    describe("GET: /api/products/:product_id", () => {
      test("Should return the product relative to its ID", async () => {
        const response = await request(app).get("/api/products/1").expect(200);
        const { product } = response.body;
        expect(product).toHaveProperty("product_id", expect.any(Number));
        expect(product).toHaveProperty("product_name", expect.any(String));
        expect(product).toHaveProperty("price", expect.any(Number));
        expect(product).toHaveProperty("description", expect.any(String));
        expect(product).toHaveProperty("stock", expect.any(Number));
        expect(product).toHaveProperty("category", expect.any(Number));
        expect(product).toHaveProperty("product_reviews", expect.any(Array));
        product.product_reviews.forEach((review) => {
          expect(review).toHaveProperty("review_id", expect.any(Number));
          expect(review).toHaveProperty("product_id", expect.any(Number));
          expect(review).toHaveProperty("user_id", expect.any(Number));
          expect(review).toHaveProperty("rating", expect.any(Number));
          expect(review).toHaveProperty("review_text", expect.any(String));
          expect(review).toHaveProperty("created_at", expect.any(String));
        });
      });
      describe("GET 400 & 404", () => {
        test("Should return a 400 status and error message if the product ID is invalid", async () => {
          const response = await request(app)
            .get("/api/products/notanumber")
            .expect(400);
          const { msg } = response.body;
          expect(msg).toBe("Bad request: Invalid product ID");
        });
        test("Should return a 404 status and error message if the product ID is non-existent", async () => {
          const response = await request(app)
            .get("/api/products/9999")
            .expect(404);
          const { msg } = response.body;
          expect(msg).toBe("Product not found");
        });
      });
    });
    describe("GET: /api/products/:product:id/reviews", () => {
      test("Should return an array of review objects relative to product id", async () => {
        const response = await request(app)
          .get("/api/products/1/reviews")
          .expect(200);
        const { reviews } = response.body;
        expect(reviews.length).toBeGreaterThan(0);
        reviews.forEach((review) => {
          expect(review).toHaveProperty("review_id", expect.any(Number));
          expect(review).toHaveProperty("product_id", expect.any(Number));
          expect(review).toHaveProperty("user_id", expect.any(Number));
          expect(review).toHaveProperty("rating", expect.any(Number));
          expect(review).toHaveProperty("review_text", expect.any(String));
          expect(review).toHaveProperty("created_at", expect.any(String));
        });
      });
      describe("GET 400 & 404", () => {
        test("Should return a 400 status and a error message when the products review ID is invalid", async () => {
          const response = await request(app)
            .get("/api/products/notanumber/reviews")
            .expect(400);
          const { msg } = response.body;
          expect(msg).toBe("Bad request: Invalid product ID");
        });
        test("Should return a 404 status and a error message when the products review ID is non-existent", async () => {
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
      expect(orders.length).toBeGreaterThan(0);
      orders.forEach((order) => {
        expect(order).toHaveProperty("order_id", expect.any(Number));
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
        expect(order).toHaveProperty("total", expect.any(Number));
        expect(order).toHaveProperty("created_at", expect.any(String));
      });
      describe("GET 400 & 404", () => {
        test("Should return a 400 status and error message if order ID is invalid", async () => {
          const response = await request(app)
            .get("/api/orders/notvalidid")
            .expect(400);
          const { msg } = response.body;
          expect(msg).toBe("Bad request: Invalid order ID");
        });
        test("Should return a 404 status and error message if order ID is non-existent", async () => {
          const response = await request(app)
            .get("/api/orders/1000")
            .expect(404);
          const { msg } = response.body;
          expect(msg).toBe("Order does not exist");
        });
      });
    });
  });

  describe("GET: /api/reviews", () => {
    test("Should return an array or review object", async () => {
      const response = await request(app).get("/api/reviews").expect(200);
      const { reviews } = response.body;
      reviews.forEach((review) => {
        expect(review).toHaveProperty("review_id", expect.any(Number));
        expect(review).toHaveProperty("product_id", expect.any(Number));
        expect(review).toHaveProperty("user_id", expect.any(Number));
        expect(review).toHaveProperty("rating", expect.any(Number));
        expect(review).toHaveProperty("review_text", expect.any(String));
        expect(review).toHaveProperty("created_at", expect.any(String));
      });
    });
    describe("GET: /api/reviews/:review_id", () => {
      test("Should return a review object by its ID", async () => {
        const response = await request(app).get("/api/reviews/1").expect(200);
        const { review } = response.body;
        expect(review).toHaveProperty("review_id", expect.any(Number));
        expect(review).toHaveProperty("product_id", expect.any(Number));
        expect(review).toHaveProperty("user_id", expect.any(Number));
        expect(review).toHaveProperty("rating", expect.any(Number));
        expect(review).toHaveProperty("review_text", expect.any(String));
        expect(review).toHaveProperty("created_at", expect.any(String));
      });
      describe("GET 400 & 404", () => {
        test("Should return a 400 status and error message if review ID is invalid", async () => {
          const response = await request(app)
            .get("/api/reviews/one")
            .expect(400);
          const { msg } = response.body;
          expect(msg).toBe("Bad request: Invalid review ID");
        });
        test("Should return a 404 status and error message if review ID is non-existent", async () => {
          const response = await request(app)
            .get("/api/reviews/1111")
            .expect(404);
          const { msg } = response.body;
          expect(msg).toBe("Review not found");
        });
      });
    });
  });
});

describe("POST REQUESTS", () => {
  describe("POST: /api/categories", () => {
    test("Should successfully post a new category", async () => {
      const postedCategory = {
        category_name: "Game Consoles",
      };
      const response = await request(app)
        .post("/api/categories")
        .send(postedCategory)
        .expect(201);
      const { newCategory } = response.body;
      expect(newCategory).toHaveProperty("category_id", expect.any(Number));
      expect(newCategory).toHaveProperty("category_name", "Game Consoles");
    });
    describe("POST 400", () => {
      test("Should return a 400 status and a error message if the new category has no values", async () => {
        const response = await request(app).post("/api/categories").expect(400);
        const { msg } = response.body;
        expect(msg).toBe("Bad request: No fields provided in the request body");
      });
      test("Should return a 400 status and a error message if the fields aren't correct", async () => {
        const postedCategory = {
          incorrect_name: "Fail",
        };
        const response = await request(app).post("/api/categories").expect(400);
        const { msg } = response.body;
        expect(msg).toBe("Bad request: No fields provided in the request body");
      });
    });
  });

  describe("POST: /api/products", () => {
    describe("POST: 201", () => {
      test("Should successfully post a new product", async () => {
        const newProduct = {
          product_name: "Playstation 5 disc edition",
          price: 349.99,
          description: "Gaming console",
          stock: 12,
          category_id: 1,
          image_url: "https://example.com/images/macbook-pro-m4.jpg",
        };
        const response = await request(app)
          .post("/api/products")
          .send(newProduct)
          .expect(201);
        const { product } = response.body;
        expect(product).toHaveProperty("product_id", expect.any(Number));
        expect(product).toHaveProperty(
          "product_name",
          "Playstation 5 disc edition"
        );
        expect(product).toHaveProperty("price", 349.99);
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

  describe("POST: /api/orders", () => {
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
        expect(msg).toBe(
          "Bad request: Invalid or missing total. It must be a non-negative number."
        );
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
        expect(msg).toBe(
          "Bad request: Invalid or missing total. It must be a non-negative number."
        );
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
        expect(msg).toBe(
          "Bad request: Invalid or missing user ID. It must be a positive number."
        );
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
        expect(newProductReview).toHaveProperty(
          "created_at",
          expect.any(String)
        );
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
});

describe("PATCH REQUESTS", () => {
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
        expect(msg).toBe("Bad request: No updates provided");
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
        expect(msg).toBe("Bad request: Invalid fields provided");
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

  describe("PATCH: /api/orders/:order_id", () => {
    test("Should successfully update a order by its ID", async () => {
      const patchedOrder = {
        user_id: 1,
        order_id: 1,
        total: 42.0,
      };
      const response = await request(app)
        .patch("/api/orders/3")
        .send(patchedOrder)
        .expect(200);
      const { updatedOrder } = response.body;
      expect(updatedOrder).toHaveProperty("user_id", expect.any(Number));
      expect(updatedOrder).toHaveProperty("order_id", expect.any(Number));
      expect(updatedOrder).toHaveProperty("total", expect.any(Number));
      expect(updatedOrder).toHaveProperty("created_at", expect.any(String));
    });
    describe("PATCH 400 & 404", () => {
      test("Should return a 400 status code and error message if order patch has nothing to send", async () => {
        const response = await request(app)
          .patch("/api/orders/1")
          .send()
          .expect(400);
        const { msg } = response.body;
        expect(msg).toBe(
          "Bad request: Invalid or missing total. It must be a non-negative number."
        );
      });
      test("Should return a 404 status code and error message if order is non-existent", async () => {
        const patchedOrder = {
          user_id: 1,
          order_id: 1,
          total: 42.0,
        };
        const response = await request(app)
          .patch("/api/orders/9999")
          .send(patchedOrder)
          .expect(404);
        const { msg } = response.body;
        expect(msg).toBe("Order not found");
      });
    });
  });

  describe("PATCH: /api/reviews/:review_id", () => {
    test("Should successfully update a review by it's id", async () => {
      const patchedReview = {
        rating: 1,
        review_text: "Why am I selling running shoes in a tech shop?",
      };
      const response = await request(app)
        .patch("/api/reviews/7")
        .send(patchedReview)
        .expect(200);
      const { updatedReview } = response.body;
      expect(updatedReview).toHaveProperty("review_id", expect.any(Number));
      expect(updatedReview).toHaveProperty("product_id", expect.any(Number));
      expect(updatedReview).toHaveProperty("user_id", expect.any(Number));
      expect(updatedReview).toHaveProperty("rating", expect.any(Number));
      expect(updatedReview).toHaveProperty("review_text", expect.any(String));
      expect(updatedReview).toHaveProperty("created_at", expect.any(String));
    });
  });
});

describe("DELETE REQUESTS", () => {
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

  describe("DELETE: /api/orders/:order_id", () => {
    test("Should successfully delete an order by its ID", () => {
      return request(app).delete("/api/orders/1").expect(204);
    });
    describe("DELETE 400 & 404", () => {
      test("Should return a 400 status and error message if order ID is invalid", async () => {
        const response = await request(app)
          .delete("/api/orders/notavalidid")
          .expect(400);
        const { msg } = response.body;
        expect(msg).toBe("Bad request: Invalid order ID");
      });
      test("Should return a 404 status and error message if order ID is non-existent", async () => {
        const response = await request(app)
          .delete("/api/orders/9999")
          .expect(404);
        const { msg } = response.body;
        expect(msg).toBe("Order not found");
      });
    });
  });

  describe("DELETE: /api/reviews/:review_id", () => {
    test("Should successfully delete a review by it's ID", async () => {
      const response = await request(app).delete("/api/reviews/7").expect(204);
    });
    describe("DELETE 400 & 404", () => {
      test("Should return a 400 status and error message if review ID is invalid", async () => {
        const response = await request(app)
          .delete("/api/reviews/seven")
          .expect(400);
        const { msg } = response.body;
        expect(msg).toBe("Bad request: Invalid review ID");
      });
      test("Should return a 404 status and error message if review ID is non-existent", async () => {
        const response = await request(app)
          .delete("/api/reviews/7777")
          .expect(404);
        const { msg } = response.body;
        expect(msg).toBe("Review not found");
      });
    });
  });
});

describe("PAGINATION / FILTERING / SORTING", () => {
  describe("PAGINATION", () => {
    test("Should return a limited number of products per page", async () => {
      const response = await request(app)
        .get("/api/products?limit=5&page=2")
        .expect(200);
      const { products } = response.body;
      expect(products).toBeInstanceOf(Array);
      expect(products).toHaveLength(5);
      expect(products[0]).toHaveProperty("product_id", 6);
    });
    test("Should return a limited number of products per page", async () => {
      const response = await request(app)
        .get("/api/products?page=500")
        .expect(200);
      const { products } = response.body;
      expect(products).toBeInstanceOf(Array);
      expect(products).toHaveLength(0);
    });
  });
  describe("SORTING", () => {
    test("Should return products sorted by price in ascending order", async () => {
      const response = await request(app)
        .get("/api/products?sort_by=price&order=asc")
        .expect(200);
      const { products } = response.body;
      expect(products).toBeInstanceOf(Array);
      expect(products).toBeSortedBy("price", {
        ascending: true,
      });
    });
    test("Should return products sorted by stock in descending order", async () => {
      const response = await request(app)
        .get("/api/products?sort_by=stock&order=desc")
        .expect(200);
      const { products } = response.body;
      expect(products).toBeInstanceOf(Array);
      expect(products).toBeSortedBy("stock", {
        descending: true,
      });
    });
    test("Should return 400 for invalid sort_by column", async () => {
      const response = await request(app)
        .get("/api/products?sort_by=invalid_column")
        .expect(400);
      const { msg } = response.body;
      expect(msg).toBe("Invalid sort_by column");
    });
    test("Should return 400 for invalid order value", async () => {
      const response = await request(app)
        .get("/api/products?order=invalid_order")
        .expect(400);
      const { msg } = response.body;
      expect(msg).toBe("Invalid order");
    });
  });
  describe("FILTERING", () => {
    test("Should return products filtered by category", async () => {
      const response = await request(app)
        .get("/api/products?category=1")
        .expect(200);
      const { products } = response.body;
      expect(products).toBeInstanceOf(Array);
      products.forEach((product) => {
        expect(product.category).toBe(1);
      });
    });
    test("Should return an empty array if no products match the category", async () => {
      const response = await request(app)
        .get("/api/products?category=9999")
        .expect(200);
      const { products } = response.body;
      expect(products).toBeInstanceOf(Array);
      expect(products).toHaveLength(0);
    });
  });
});
