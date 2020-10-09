var mongoose = require("mongoose");

var movieschema = new mongoose.Schema({
  name: String,
  image: String,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: "comment",
    },
  ],
  author:{
    id:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"user"
  },
  username:String,
  },
 
});

module.exports = mongoose.model("movie", movieschema);
