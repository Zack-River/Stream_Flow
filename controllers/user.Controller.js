const User = require("../models/user.Model");
const hash = require("../utils/hash");

exports.getUsers = async function (req, res) {
  try {
    const users = await User.find().lean();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load users!" });
  }
};

exports.getUser = async function (req, res) {
  try {
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({ message: "username is required!" });
    }

    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).json({
      user,
      isOwner: req.user.username === username
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createUser = async function (req, res) {
  try {
    const { name, username: requestusername, email, phone, password } = req.body;
    let username = requestusername;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, Email, and Password are required!" });
    }

    if (!username) {
      username = usernameify(name);
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email or Username already in use!" });
    }

    const hashedPassword = await hash.hashPassword(password);

    const newUser = new User({
      name,
      username,
      email: normalizedEmail,
      phone,
      password: hashedPassword
    });

    await newUser.save();

    // Never return password
    const { password: _, ...safeUser } = newUser.toObject();

    res.status(201).json({
      message: "User Created Successfully!",
      user: safeUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateUser = async function (req, res) {
  try {
    const currentusername = req.params.username;
    const { name, username, phone, profileImg, password, role } = req.body;

    const user = await User.findOne({ username: currentusername }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    if (name) user.name = name;

    if (username && username !== currentusername) {
      const matchusername = await User.findOne({ username });
      if (matchusername) {
        return res.status(400).json({ message: "username already used!" });
      }
      user.username = username;
    }

    if (phone) user.phone = phone;
    if (profileImg) user.profileImg = profileImg;

    if (password) {
      const hashedPassword = await hash.hashPassword(password);
      user.password = hashedPassword;
    }

    if (role) user.role = role;

    await user.save();

    const { password: _, ...safeUser } = user.toObject();

    res.status(200).json({
      message: "User Updated Successfully",
      user: safeUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deactivateUser = async function (req, res) {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({ message: "User deactivated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};