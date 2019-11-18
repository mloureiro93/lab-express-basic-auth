"use strict";

const { Router } = require("express");
const router = new Router();

const User = require("./../models/user");
const bcryptjs = require("bcryptjs");

router.get("/", (req, res, next) => {
  res.render("index", { title: "Hello World!" });
});

router.get("/sign-up", (req, res, next) => {
  res.render("sign-up");
});

router.post("/sign-up", (req, res, next) => {
  const { username, name, password } = req.body;
  bcryptjs
    .hash(password, 10)
    .then(hash => {
      return User.create({
        username,
        name,
        passwordHash: hash
      });
    })
    .then(user => {
      console.log("Created user", user);
      console.log(req.session);
      req.session.user = user._id;
      res.redirect("/");
    })
    .catch(error => {
      next(error);
    });
});

// Sign In
router.get("/sign-in", (req, res, next) => {
  res.render("sign-in");
});

router.post("/sign-in", (req, res, next) => {
  let userId;
  const { username, password } = req.body;
  User.findOne({ username })
    .then(user => {
      if (!user) {
        // If no user was found, return a rejection with an error
        // that will be sent to the error handler at the end of the promise chain
        return Promise.reject(new Error("There's no user with that username."));
      } else {
        // If there is an user,
        // save their ID to an auxiliary variable
        userId = user._id;
        // Compare the password with the salt + hash stored in the user document
        return bcryptjs.compare(password, user.passwordHash);
      }
    })
    .then(result => {
      if (result) {
        // If they match, the user has successfully been signed up
        req.session.user = userId;
        res.redirect("/");
      } else {
        // If they don't match, reject with an error message
        return Promise.reject(new Error("Wrong password."));
      }
    })
    .catch(error => {
      next(error);
    });
});

router.get("/private", (req, res, next) => {
  res.render("private");
});

router.get("/main", (req, res, next) => {
  res.render("main");
});

const routeGuard = require("./../middleware/route-guard");

router.get("/profile", routeGuard, (req, res, next) => {
  res.render("profile");
});

router.get("/profile/edit", (req, res, next) => {
  User.findById(req.user._id);
  res.render("edit");
});

router.post("/profile/edit", (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, {
    name: req.body.name
  })
    .then(() => {
      res.redirect("/profile");
    })
    .catch(error => {
      next(error);
    });
});

module.exports = router;
