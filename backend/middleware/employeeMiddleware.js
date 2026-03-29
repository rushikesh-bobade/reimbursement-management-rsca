module.exports = (req, res, next) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({
      error: "Employee access only"
    });
  }

  next();
};