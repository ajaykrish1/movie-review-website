var mongoose = require("mongoose");

var mymovieschema = new mongoose.Schema({
  name: String,
  image: String,
  userid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
},
});

module.exports = mongoose.model("mymovie", mymovieschema);
