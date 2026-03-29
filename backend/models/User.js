const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Company = require("./Company");

const User = sequelize.define("User", {
  name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  password: DataTypes.STRING,
  role: {
    type: DataTypes.STRING,
    defaultValue: "admin"
  },
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

Company.hasMany(User, { foreignKey: "company_id" });
User.belongsTo(Company, { foreignKey: "company_id" });

module.exports = User;