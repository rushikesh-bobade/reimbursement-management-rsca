const { z } = require("zod");

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  country: z.string().min(2)
});

module.exports = signupSchema;
