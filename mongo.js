const mongoose = require("mongoose");
let mongooseConnectionString = process.env.mongooseConnectionString;
module.exports = async () => {
  await mongoose.connect(mongooseConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to Mongoose!");
  return mongoose;
};
