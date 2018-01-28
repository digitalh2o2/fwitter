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
app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

app.get("/signup", (req, res) => {
  res.render("signup", { user: req.user });
});

app.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

app.get(
  "/profile",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res) => {
    res.render("profile", { user: req.user });
  }
);

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

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
      res.status(400).send("error", e);
    });
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/tweet", (req, res) => {
  res.render("new-tweet", { user: req.user });
});

app.post(
  "/tweet",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res) => {
    console.log(req);
    let myTweet = new Tweet({
      tweetBody: req.body.tweetBody,
      createdBy: req.user.username,
      _author: req.user._id
    });

    myTweet
      .save(tweet => {
        res.redirect("/profile");
      })
      .catch(e => {
        res.status(400).send("error", e);
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
        res.render("tweets", { tweets, user: req.user });
      })
      .catch(e => {
        res.status(400).send("error", e);
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
        res.render("tweet", { tweet, user: req.user });
      })
      .catch(e => {
        res.status(400).send("error", e);
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
        res.render("edit", { tweet, user: req.user });
      })
      .catch(e => {
        res.status(400).send("Error", e);
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

app.delete("/tweets/:id/delete", (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Tweet.findOneAndRemove({
    _id: id
  })
    .then(tweet => {
      tweet.lowerTweets();
      res.send("Tweet Deleted!");
    })
    .catch(e => {
      res.status(400).send("Unable to delete tweet!");
    });
});

app.get(
  "/timeline",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res) => {
    Tweet.find()
      .populate("Tweet")
      .exec(function(err, tweet) {
        if (err) {
          console.log(err);
        }
        console.log(tweet);
      })
      .then(tweets => {
        res.render("timeline", { tweets, user: req.user });
      })
      .catch(e => {
        res.status(404).send("Unable to find tweets!");
      });
  }
);

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
