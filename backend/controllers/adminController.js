const bcrypt = require("bcrypt");
const User = require("../models/user");
const createUserSchema = require("../validators/createUserSchema");

exports.createUser = async (req, res) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors
      });
    }

    const { name, email, password, role, manager_id } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      manager_id,
      company_id: req.user.company_id
    });

    res.status(201).json({
      message: "User created",
      user
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

exports.getUsers = async (req, res) => {
  const users = await User.findAll({
    where: {
      company_id: req.user.company_id
    }
  });

  res.json(users);
};