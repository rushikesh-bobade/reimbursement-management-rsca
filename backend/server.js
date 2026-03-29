const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");

require("./models/Company");
require("./models/user");
require("./models/ExpenseCategory");
require("./models/Expense");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/authRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/expenses", require("./routes/expenseRoutes"));

sequelize.sync({ alter: true }).then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port 5000");
  });
});