var mongoose = require("mongoose");

var comschema = new mongoose.Schema({
  author: String,
  text: String,
});

module.exports = mongoose.model("comment", comschema);
