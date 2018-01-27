require("./server/passport.js");

const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const _ = require("lodash");
const { mongoose } = require("./server/db/mongoose");
const { User } = require("./models/user");
const { Tweet } = require("./models/tweet");
const { ObjectID } = require("mongodb");
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
app.use(express.static(__dirname + "/public"));
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

app.get(
  "/tweets",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res) => {
    Tweet.find({
      _author: req.user._id
    })
      .then(tweets => {
        res.render("tweets", { tweets });
      })
      .catch(e => {
        res.send("error", e);
      });
  }
);

app.get(
  "/tweets/:id",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res) => {
    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    Tweet.findOne({
      _id: id,
      _author: req.user._id
    })
      .then(tweet => {
        res.render("tweet", { tweet });
      })
      .catch(e => {
        res.send("error", e);
      });
  }
);

app.get(
  "/tweets/:id/edit",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res) => {
    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    Tweet.findById({
      _id: id
    })
      .then(tweet => {
        res.render("edit", { tweet });
      })
      .catch(e => {
        res.send("Error", e);
      });
  }
);

app.put("/tweets/:id", (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ["tweetBody"]);

  Tweet.findOneAndUpdate(
    {
      _id: id
    },
    { $set: body },
    { new: true }
  )
    .then(tweet => {
      if (!tweet) {
        res.status(400).send("Can't find tweet!");
      }
      res.send({ tweet });
    })
    .catch(e => {
      res.status(400).send("Unable to edit tweet.");
    });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
