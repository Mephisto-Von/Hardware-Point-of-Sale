let express = require("express"),
  http = require("http"),
  app = require("express")(),
  server = http.createServer(app),
  bodyParser = require("body-parser"),
  httpProxy = require("http-proxy");

const PORT = process.env.PORT || 8001;

console.log("Server started");
const path = require("path");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static assets for web browser clients
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
const uploadsDir = process.env.APPDATA
  ? path.join(process.env.APPDATA, "MetroPOS", "uploads")
  : path.join(__dirname, "data", "uploads");
if (!require("fs").existsSync(uploadsDir)) {
  require("fs").mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

app.all("/*", function(req, res, next) {
 
  res.header("Access-Control-Allow-Origin", "*");  
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-type,Accept,X-Access-Token,X-Key"
  );
  if (req.method == "OPTIONS") {
    res.status(200).end();
  } else {
    next();
  }
});

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use("/api/inventory", require("./api/inventory"));
app.use("/api/customers", require("./api/customers"));
app.use("/api/categories", require("./api/categories"));
app.use("/api/settings", require("./api/settings"));
app.use("/api/users", require("./api/users"));
app.use("/api", require("./api/transactions"));

// WhatsApp Web proxy — strips X-Frame-Options so it loads in an iframe
var whatsappProxy = httpProxy.createProxyServer({
  target: "https://web.whatsapp.com",
  changeOrigin: true,
  secure: true,
});

whatsappProxy.on("proxyRes", function (proxyRes, req, res) {
  delete proxyRes.headers["x-frame-options"];
  delete proxyRes.headers["X-Frame-Options"];
  delete proxyRes.headers["content-security-policy"];
  delete proxyRes.headers["Content-Security-Policy"];
});

whatsappProxy.on("error", function (err, req, res) {
  if (res && !res.headersSent) {
    res.statusCode = 502;
    res.end("Proxy error");
  }
});

app.use("/whatsapp-proxy", function (req, res, next) {
  req.url = req.originalUrl.replace(/^\/whatsapp-proxy/, "") || "/";
  whatsappProxy.web(req, res);
});

server.on("upgrade", function (req, socket, head) {
  if (req.url && req.url.startsWith("/whatsapp-proxy")) {
    req.url = req.url.replace(/^\/whatsapp-proxy/, "");
    whatsappProxy.ws(req, socket, head);
  }
});

server.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
