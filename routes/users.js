const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("../config/database");
const User = require("../models/user");

// Register
router.post("/register", (req, res, next) => {
  const { name, email, username, password } = req.body;
  let newUser = new User({
    name: name,
    email: email,
    username: username,
    password: password
  });
 
  User.addUser(newUser, (err, user) => {
    if (err) {
      res.json({ success: false, msg: "failed to register user" });
    } else {
      res.json({ success: true, msg: "User registered" });
    }
  });
});

// Authenticate
router.post("/authenticate", (req, res, next) => {
  const { username, password } = req.body;
  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json({ success: false, msg: "User not found" });
    }
    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        const token = jwt.sign({ data: user }, config.secret, {
          expiresIn: 604800 // a week
        });
        res.json({
          success: true,
          token: "JWT" + token,
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        });
      } else {
        return res.json({ success: false, msg: "Wrong password" });
      }
    });
  });
});

// Profile
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.json({ user: req.user });
  }
);

//test- Validate
// router.get('/validate', (req, res, next) => {
//   res.send('VALIDATE');
// });

module.exports = router;
