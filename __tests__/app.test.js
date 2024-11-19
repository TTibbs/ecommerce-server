const app = require("../src/app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const endpointsCheck = require("../src/endpoints.json");
require("jest-sorted");

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
  describe("GET: 200", () => {
    test("Should return an array of products", () => {
      return request(app)
        .get("/api/products")
        .expect(200)
        .then(({ body: { products } }) => {
          products.forEach((product) => {
            expect(product).toHaveProperty("id", expect.any(Number));
            expect(product).toHaveProperty("name", expect.any(String));
            expect(product).toHaveProperty("price", expect.any(String));
            expect(product).toHaveProperty("description", expect.any(String));
            expect(product).toHaveProperty("stock", expect.any(Number));
            expect(product).toHaveProperty("category", expect.any(String));
          });
        });
    });
  });
});
