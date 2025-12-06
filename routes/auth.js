const express = require("express");
const router = express.Router();
const User = require("../models/netflixUser");
const DeletedUser =require("../models/deletedUser")
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
 const jwt = require("jsonwebtoken");

// Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// REGISTER
router.post("/register", async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 15 * 60 * 1000;
  
    const user = new User({
      userName,
      email,
      password: hashedPassword,
      token,
      tokenExpiry,
    });

    await user.save();

    const verifyURL = `${process.env.BACKEND_URL}/verify/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `<h2>NetflixClone - Email Verification</h2>
             <a href="${verifyURL}">Click to Verify</a>`,
    });

    res.json({ msg: "Verification email sent" });

  } catch (error) {
    console.error(error);
res.status(500).json({ msg: "Server Error" });
  }
});


// VERIFY EMAIL
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ token: req.params.token });
    if (!user) return res.send("Invalid token");

    if (user.tokenExpiry < Date.now()) {
      user.token = "";
      user.tokenExpiry = null;
      await user.save();
      return res.send("Verification link expired. Register again.");
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


// SIGNIN
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Email or Password" });

    if (!user.isVerified)
      return res.status(401).json({ msg: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid Email or Password" });


    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.json({
      msg: "Login Successful",
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(error);
res.status(500).json({ msg: "Server Error" });
  }
});

// SIGNOUT
router.post("/signOut", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ msg: "Token missing" });

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ msg: "Token invalid" });
      return res.json({ msg: "Signout successful" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});


// FORGOT PASSWORD send reset link
router.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "No user found with this email" });

    if (!user.isVerified) {
      return res.status(401).json({ msg: "Please verify your email first" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetURL = `${process.env.BACKEND_URL}/resetverify/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html: `
        <h2>Password Reset Link</h2>
        <p>This link expires in 15 minutes.</p>
        <a href="${resetURL}">Click to generate a new password</a>
      `,
    });

    res.json({ msg: "Reset link sent to email" });

  } catch (error) {
    console.error(error);
res.status(500).json({ msg: "Server Error" });
  }
});



// RESET VERIFY show temporary password
router.get("/resetverify/:resetToken", async (req, res) => {
  try {
    const user = await User.findOne({ resetToken: req.params.resetToken });

    if (!user) return res.send("Invalid or expired link");

    if (user.resetTokenExpiry < Date.now()) {
      user.resetToken = "";
      user.resetTokenExpiry = null;
      await user.save();
      return res.send("Reset link expired");
    }

    const plainNewPass = crypto.randomBytes(3).toString("hex"); 

    const hashedPass = await bcrypt.hash(plainNewPass, 10);

    
    user.password = hashedPass;
    user.resetToken = "";
    user.resetTokenExpiry = null;
    await user.save();

    
    res.send(`
      <h2>Password Reset Successful</h2>
      <p>Your new password is:</p>
      <h3>${plainNewPass}</h3>
      <p>Please logIn using above Password</p>
    `);

  } catch (error) {
    console.error(error);
    res.send("Reset failed");
  }
});


// GET all users
router.get("/userslist", async (req, res) => {
  try {
    const users = await User.find({}); // fetch all users from MongoDB
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

//Remove users-

router.delete("/removeuser/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await DeletedUser.create({
      originalId: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      isVerified: user.isVerified
    });

    await User.deleteOne({ _id: id });

    res.json({ success: true, message: "User moved to deleted collection" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/updateplan", async (req, res) => {
  const { email, planName, planPrice, planQuality } = req.body;
console.log("incoming plan update",req.body);
  try {
    const accStart = new Date(); // current date
    const accEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 days

    const user = await User.findOneAndUpdate(
      { email },
      {
        plan: {
          name: planName,
          price: planPrice,
          quality: planQuality,
          start: accStart,
          expiry: accEnd
        }
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Plan updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

//userprofile 
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(401).json({ message: "Token missing" });

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({
      userName: user.userName,
      email: user.email,
      plan: user.plan,
      startDate: user.plan?.start,
      expiryDate: user.plan?.expiry,
       isVerified: user.isVerified,
    });

  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
});


module.exports = router;
