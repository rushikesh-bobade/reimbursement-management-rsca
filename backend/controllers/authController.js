const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Company = require("../models/Company");
const User = require("../models/user");

const signupSchema = require("../validators/signupSchema");
const loginSchema = require("../validators/loginSchema");

exports.signup = async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors
      });
    }

    const { name, email, password, country } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await Company.create({
      name: `${name} Company`,
      country,
      currency: "INR"
    });

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      company_id: company.id
    });

    res.status(201).json({
      message: "Signup successful",
      user
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        company_id: user.company_id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};