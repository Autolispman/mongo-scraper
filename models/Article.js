const mongoose = require("mongoose");
const schema = mongoose.Schema;
//const note = require("./note");


let articleSchema = new mongoose.Schema({
    headline: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    saved: {
        type: Boolean,
        default: false
    },
    notes: [{
        type: schema.Types.ObjectId,
        ref: "Note"
     }]
});

let article = mongoose.model("article", articleSchema);

module.exports = article;