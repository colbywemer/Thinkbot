const mongoose = require('mongoose');
const { mongooseConnectionString } = process.env.mongoose
module.exports = async () => {
    await mongoose.connect(mongooseConnectionString,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    return mongoose
}