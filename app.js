require("./server/passport.js");

const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const _ = require("lodash");
const { mongoose } = require("./server/db/mongoose");
const { User } = require("./models/user");
const { Tweet } = require("./models/tweet");
const port = process.env.PORT || 3000;

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

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/profile", require("connect-ensure-login").ensureLoggedIn(), function(
  req,
  res
) {
  res.render("profile", { user: req.user });
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/");
  }
);

// Testing through Postman
app.post("/signup", (req, res) => {
  let body = _.pick(req.body, [
    "username",
    "tweets",
    "followers",
    "email",
    "password"
  ]);
  let user = new User(body);

  user
    .save()
    .then(user => {
      res.redirect("/");
    })
    .catch(e => {
      console.log("error", e);
    });
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/tweet", (req, res) => {
  res.render("new-tweet");
});

app.post(
  "/tweet",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res) => {
    let myTweet = new Tweet({
      tweetBody: req.body.tweetBody,
      _author: req.user._id
    });

    myTweet
      .save(tweet => {
        res.redirect("/profile");
      })
      .catch(e => {
        console.log("error", e);
      });
  }
);

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
