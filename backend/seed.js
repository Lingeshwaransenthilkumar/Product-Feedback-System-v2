const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Admin = require("./models/Admin");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log(err));

const createAdmin = async () => {
  const hashedPassword = await bcrypt.hash("shanthi123", 10); // default password
  const admin = new Admin({
    name: "Shanthi",
    email: "Shanthi@gmail.com",
    password: hashedPassword,
  });

  await admin.save();
  console.log("✅ Admin inserted:", admin);
  mongoose.disconnect();
};

createAdmin();
