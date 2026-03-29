const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ExpenseCategory = sequelize.define("ExpenseCategory", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = ExpenseCategory;