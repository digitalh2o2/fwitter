const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const Strategy = require("passport-local").Strategy;
const db = require("./db");
const { mongoose } = require("./server/db/mongoose");
const { User } = require("./models/user");
const port = process.env.PORT || 3000;

passport.use(
  new Strategy(function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb(null, false);
      }
      if (user.password != password) {
        return cb(null, false);
      }
      return cb(null, user);
    });
  })
);

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function(err, user) {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

var app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Application middleware
app.use(bodyParser.json());
app.use(require("morgan")("combined"));
app.use(require("cookie-parser")());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get("/", function(req, res) {
  res.render("home", { user: req.user });
});

app.get("/login", function(req, res) {
  res.render("login");
});

// Testing through Postman
app.post("/users", (req, res) => {
  console.log(req.body);
  let user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  });

  user
    .save()
    .then(user => {
      res.send(user);
    })
    .catch(e => {
      console.log("error", e);
    });
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/");
  }
);

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/profile", require("connect-ensure-login").ensureLoggedIn(), function(
  req,
  res
) {
  res.render("profile", { user: req.user });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
