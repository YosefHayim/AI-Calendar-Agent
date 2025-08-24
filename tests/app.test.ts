import { app } from "@/app";
import request from "supertest";

describe("App routes", () => {
  it("GET / should return Server is running", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Server is running.");
  });

  it("GET /users should return something", async () => {
    const res = await request(app).get("/users");
    expect([200, 401, 403]).toContain(res.status); 
  });
});
