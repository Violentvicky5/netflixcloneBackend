const express = require("express");
const router = express.Router();
const User = require("../models/netflixUser");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Register Route
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "Email already exists" });

    const token = crypto.randomBytes(32).toString("hex");

    user = new User({ email, password, token });
    await user.save();

    const verifyURL = `${process.env.BACKEND_URL}/verify/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `<h2>NetflixClone - Email Verification</h2>
             <a href="${verifyURL}">Click Here to Verify</a>`,
    });

    res.json({ msg: "Verification email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Verify Route
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ token: req.params.token });

    if (!user) return res.send("Invalid or expired token");

    user.isVerified = true;
    user.token = "";
    await user.save();

    res.send("Email Verified Successfully!");
  } catch (error) {
    console.error(error);
    res.send("Verification Failed");
  }
});

//SignIn Route
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Email or Password" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ msg: "Please verify your email first" });
    }

    if (user.password !== password) {
      return res.status(400).json({ msg: "Invalid Email or Password" });
    }

    return res.json({
      msg: "Login Successful",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
