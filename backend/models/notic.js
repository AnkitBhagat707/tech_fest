const mongoose = require('mongoose');
const noticeSchema = new mongoose.Schema({
    title: String,
    image: {
        type :String,
        required:true
    },
    date: {
        type: Date,
        default: Date.now
    }
});



module.exports = mongoose.model("Notice", noticeSchema);