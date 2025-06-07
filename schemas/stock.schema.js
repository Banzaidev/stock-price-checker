const mongoose = require('mongoose')

const stockSchema = new mongoose.Schema({
    symbol: {type: String, require: true},
    likes: {
        number_likes: {type: Number, default: 0},
        ip: {type: [String], default: []}
    }
})


module.exports = stockSchema