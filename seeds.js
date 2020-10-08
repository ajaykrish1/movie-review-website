var mongoose = require("mongoose");
var comment = require("./models/comment");
var movie = require("./models/movie");
var data = [
  {
    name: "Iron man",
    image:
      "https://i.annihil.us/u/prod/marvel/i/mg/5/f0/5de548020b82a/clean.jpg",
  },
  {
    name: "Iron man 2",
    image:
      "https://images-na.ssl-images-amazon.com/images/I/91SdhGAiBKL._RI_.jpg",
  },
];
function seedDB() {
  movie.remove({}, function (err) {
    if (err) {
      console.log(err);
    }
    console.log("removed movies");
    data.forEach(function (seed) {
      movie.create(seed, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log("added a campground");
          comment.create({ author: "ajay", text: "adsasdf" }, function (
            err,
            comment
          ) {
            if (err) {
              console.log(err);
            } else {
              data.comments.push(comment);
              console.log("added a comment");
              data.save();
            }
          });
        }
      });
    });
  });
}

module.exports = seedDB;
