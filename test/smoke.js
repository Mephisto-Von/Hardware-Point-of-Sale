const http = require("http");

const BASE = "http://localhost:8001";
let passed = 0;
let failed = 0;

async function request(method, path, body, headers) {
  return new Promise((resolve, reject) => {
    const opts = { method, hostname: "localhost", port: 8001, path };
    if (headers) opts.headers = headers;
    const req = http.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function test(name, fn) {
  process.stdout.write(`  ${name} ... `);
  try {
    await fn();
    console.log("PASS");
    passed++;
  } catch (e) {
    console.log("FAIL  -- " + e.message);
    failed++;
  }
}

async function main() {
  console.log("\nSmoke Tests\n");

  await test("Root page returns 200", async () => {
    const r = await request("GET", "/");
    if (r.status !== 200) throw new Error("Expected 200, got " + r.status);
    if (!r.data.includes("<html")) throw new Error("Expected HTML");
  });

  await test("API /check creates admin", async () => {
    const r = await request("GET", "/api/users/check");
    if (r.status !== 200) throw new Error("Expected 200, got " + r.status);
    const j = JSON.parse(r.data);
    if (!j.status) throw new Error("Expected status field");
  });

  let token;
  await test("Login with admin/admin returns token", async () => {
    const body = JSON.stringify({ username: "admin", password: "admin" });
    const r = await request("POST", "/api/users/login", body, {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    });
    if (r.status !== 200) throw new Error("Expected 200, got " + r.status);
    const j = JSON.parse(r.data);
    if (!j.token) throw new Error("Expected JWT token");
    if (!j.user) throw new Error("Expected user object");
    if (j.user.password) throw new Error("Password should not be exposed");
    token = j.token;
  });

  await test("Authenticated /api/users/all returns users", async () => {
    const r = await request("GET", "/api/users/all", null, {
      Authorization: "Bearer " + token,
    });
    if (r.status !== 200) throw new Error("Expected 200, got " + r.status);
    const users = JSON.parse(r.data);
    if (!Array.isArray(users)) throw new Error("Expected array");
    if (users.length < 1) throw new Error("Expected at least 1 user");
  });

  await test("Unauthenticated /api/inventory/ returns 401", async () => {
    const r = await request("GET", "/api/inventory/");
    if (r.status !== 401) throw new Error("Expected 401, got " + r.status);
  });

  await test("Authenticated /api/inventory/ returns 200", async () => {
    const r = await request("GET", "/api/inventory/", null, {
      Authorization: "Bearer " + token,
    });
    if (r.status !== 200) throw new Error("Expected 200, got " + r.status);
  });

  await test("Wrong token returns 401", async () => {
    const r = await request("GET", "/api/inventory/", null, {
      Authorization: "Bearer invalidtoken",
    });
    if (r.status !== 401) throw new Error("Expected 401, got " + r.status);
  });

  await test("Login with wrong password returns 401", async () => {
    const body = JSON.stringify({ username: "admin", password: "wrong" });
    const r = await request("POST", "/api/users/login", body, {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    });
    if (r.status !== 401) throw new Error("Expected 401, got " + r.status);
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
