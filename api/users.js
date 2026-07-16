const app = require("express")();
const server = require("http").Server(app);
const bodyParser = require("body-parser");
const Datastore = require("@seald-io/nedb");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { generateToken, verifyToken } = require("./auth");

const DATA_DIR = process.env.APPDATA
  ? path.join(process.env.APPDATA, "HardwarePOS")
  : path.join(__dirname, "..", "data");

const dbDir = path.join(DATA_DIR, "server", "databases");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

app.use(bodyParser.json());

let usersDB = new Datastore({
  filename: path.join(dbDir, "users.db"),
  autoload: true,
});

usersDB.ensureIndex({ fieldName: "_id", unique: true });

app.get("/", function (req, res) {
  res.send("Users API");
});

app.get("/user/:userId", verifyToken, function (req, res) {
  if (!req.params.userId) {
    return res.status(500).send("ID field is required.");
  }
  usersDB.findOne({ _id: parseInt(req.params.userId) }, function (err, docs) {
    if (!docs) return res.status(404).json({ error: "User not found" });
    const { password, ...safe } = docs;
    res.send(safe);
  });
});

app.get("/logout/:userId", verifyToken, function (req, res) {
  if (!req.params.userId) {
    return res.status(500).send("ID field is required.");
  }
  usersDB.update(
    { _id: parseInt(req.params.userId) },
    { $set: { status: "Logged Out_" + new Date() } },
    {},
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.sendStatus(200);
    }
  );
});

app.post("/login", function (req, res) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  usersDB.findOne(
    { username: req.body.username },
    function (err, docs) {
      if (!docs) return res.status(401).json({ error: "Invalid credentials" });
      if (!bcrypt.compareSync(req.body.password, docs.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      usersDB.update(
        { _id: docs._id },
        { $set: { status: "Logged In_" + new Date() } },
        {}
      );
      const token = generateToken(docs);
      const { password, ...safe } = docs;
      res.json({ token, user: safe });
    }
  );
});

app.get("/all", verifyToken, function (req, res) {
  usersDB.find({}, function (err, docs) {
    const safe = docs.map(({ password, ...rest }) => rest);
    res.send(safe);
  });
});

app.delete("/user/:userId", verifyToken, function (req, res) {
  usersDB.remove(
    { _id: parseInt(req.params.userId) },
    function (err, numRemoved) {
      if (err) res.status(500).send(err);
      else res.sendStatus(200);
    }
  );
});

app.post("/post", verifyToken, function (req, res) {
  let User = {
    username: req.body.username,
    fullname: req.body.fullname,
    perm_products: req.body.perm_products == "on" ? 1 : 0,
    perm_categories: req.body.perm_categories == "on" ? 1 : 0,
    perm_transactions: req.body.perm_transactions == "on" ? 1 : 0,
    perm_users: req.body.perm_users == "on" ? 1 : 0,
    perm_settings: req.body.perm_settings == "on" ? 1 : 0,
    status: "",
  };
  if (req.body.password) {
    User.password = bcrypt.hashSync(req.body.password, 10);
  }
  if (req.body.id == "") {
    User._id = Math.floor(Date.now() / 1000);
    usersDB.insert(User, function (err, user) {
      if (err) res.status(500).send(req);
      else {
        const { password, ...safe } = user;
        res.send(safe);
      }
    });
  } else {
    let update = {
      username: req.body.username,
      fullname: req.body.fullname,
      perm_products: req.body.perm_products == "on" ? 1 : 0,
      perm_categories: req.body.perm_categories == "on" ? 1 : 0,
      perm_transactions: req.body.perm_transactions == "on" ? 1 : 0,
      perm_users: req.body.perm_users == "on" ? 1 : 0,
      perm_settings: req.body.perm_settings == "on" ? 1 : 0,
    };
    if (req.body.password) {
      update.password = bcrypt.hashSync(req.body.password, 10);
    }
    usersDB.update(
      { _id: parseInt(req.body.id) },
      { $set: update },
      {},
      function (err) {
        if (err) res.status(500).send(err);
        else res.sendStatus(200);
      }
    );
  }
});

app.get("/check", function (req, res) {
  usersDB.findOne({ _id: 1 }, function (err, docs) {
    if (!docs) {
      const hash = bcrypt.hashSync("admin", 10);
      let User = {
        _id: 1,
        username: "admin",
        password: hash,
        fullname: "Administrator",
        perm_products: 1,
        perm_categories: 1,
        perm_transactions: 1,
        perm_users: 1,
        perm_settings: 1,
        status: "",
      };
      usersDB.insert(User, function () {
        res.send({ status: "created" });
      });
    } else {
      res.send({ status: "exists" });
    }
  });
});

module.exports = app;
