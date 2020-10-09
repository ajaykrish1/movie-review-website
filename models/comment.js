var mongoose = require("mongoose");
const user = require("./user");

var comschema = new mongoose.Schema({
  author: {
    id:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"user",
    },
    username:String,
  },
  text: String,
});

module.exports = mongoose.model("comment", comschema);
