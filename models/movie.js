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
});

module.exports = mongoose.model("movie", movieschema);
