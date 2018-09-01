const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    _id: String,
    noteText: String
})

const Note = module.exports = mongoose.model("Note", noteSchema);