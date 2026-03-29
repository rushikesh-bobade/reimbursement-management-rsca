const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ApprovalRequest = sequelize.define("ApprovalRequest", {
  expense_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  approver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  step_order: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending"
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = ApprovalRequest;