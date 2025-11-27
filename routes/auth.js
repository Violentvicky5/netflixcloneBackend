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
    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already exists" });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins

    const user = new User({
      email,
      password,
      token,
      tokenExpiry
    });

    await user.save();

    const verifyURL = `${process.env.BACKEND_URL}/verify/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `<h2>NetflixClone - Email Verification</h2>
             <a href="${verifyURL}">Click Here to Verify</a>`
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

    if (!user) return res.send("Invalid token");

    if (user.tokenExpiry < Date.now()) {
      user.token = "";
      user.tokenExpiry = null;
      await user.save();
      return res.send("Verification link expired. Please register again.");
    }

    user.isVerified = true;
    user.token = "";
    user.tokenExpiry = null;
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


// Forgot Password Route (Send reset link)
router.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "No user found with this email" });
    if (!user.isVerified) return res.status(401).json({ msg: "Please verify your email first" });

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetURL = `${process.env.BACKEND_URL}/resetverify/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "NetflixClone - Reset Password",
      html: `<h2>Password Reset Request</h2>
             <p>This link expires in 15 minutes.</p>
             <a href="${resetURL}">View your old password</a>`
    });

    res.json({ msg: "Password reset email sent" });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});


// Reset Verify Route 
router.get("/resetverify/:resetToken", async (req, res) => {
  try {
    const user = await User.findOne({ resetToken: req.params.resetToken });

    if (!user) return res.send("Invalid token");

    if (user.resetTokenExpiry < Date.now()) {
      user.resetToken = "";
      user.resetTokenExpiry = null;
      await user.save();
      return res.send("Password reset link expired.");
    }

    const password = user.password;

    user.resetToken = "";
    user.resetTokenExpiry = null;
    await user.save();

    res.send(`Your password is: ${password}`);

  } catch (error) {
    console.error(error);
    res.send("Reset verification failed");
  }
});


module.exports = router;
