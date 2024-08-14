const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to mongoose");
  })
  .catch((err) => {
    console.error("Error connecting to mongoose", err);
  });
