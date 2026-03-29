const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Expense = sequelize.define("Expense", {
  original_amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  original_currency: {
    type: DataTypes.STRING,
    allowNull: false
  },
  converted_amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: DataTypes.TEXT,
  expense_date: DataTypes.DATEONLY,
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending"
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Expense;