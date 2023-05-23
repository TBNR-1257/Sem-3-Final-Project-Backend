const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    let userFound = await User.findOne({ username });

    if (userFound) {
      return res.status(400).json({ msg: "User already exists" });
    }

    if (name.length < 3) {
      return res
        .status(400)
        .json({ msg: "Name should be at least 3 characters" });
    }

    if (username.length < 8) {
      return res
        .status(400)
        .json({ msg: "Username should be at least 8 characters" });
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({ msg: "Please use a valid Email" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ msg: "Password should be at least 8 characters" });
    }

    let user = new User(req.body);
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password, salt);
    user.password = hash;
    user.save();
    return res.json({ user, msg: "Registered Successfully" });
  } catch (e) {
    return res.status(400).json({ e, msg: "Failed to register" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let userFound = await User.findOne({ email });

    if (!userFound) {
      return res.status(400).json({ msg: "User doesn't exist" });
    }

    let isMatch = bcrypt.compareSync(password, userFound.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    jwt.sign(
      { data: userFound },
      process.env.SECRET_KEY,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) res.status(400).json({ err, msg: "Unable to login" });
        return res.send(token);
      }
    );
  } catch (e) {
    return res.status(400).json({ e, msg: "Invalid Credentials" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({
      error,
      message: error.message,
    });
  }
});

module.exports = router;
