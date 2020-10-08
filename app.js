var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var movie = require("./models/movie");
var seedDB = require("./seeds");
var comment = require("./models/comment");
var user = require("./models/user");
var passport = require("passport");
var LocalStrategy = require("passport-local");

mongoose.connect("mongodb://localhost/moviedb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
seedDB();

app.use(
  require("express-session")({
    secret: "movie website",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use(bodyparser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("home");
});

app.post("/movies", isLoggedIn, function (req, res) {
  var addname = req.body.name;
  var addimage = req.body.image;
  var moviesobj = { name: addname, image: addimage };

  movie.create(moviesobj, function (err, movies) {
    if (err) {
      console.log("err");
    } else {
      res.redirect("/movies");
    }
  });
});
app.get("/movies", function (req, res) {
  movie.find({}, function (err, movies) {
    if (err) {
      console.log("err");
    } else {
      res.render("movies", { movies: movies });
    }
  });
});
app.get("/movies/add", isLoggedIn, function (req, res) {
  res.render("add");
});

app.get("/movies/:id", function (req, res) {
  movie
    .findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundmovie) {
      if (err) {
        console.log(err);
      } else {
        res.render("info", { movie: foundmovie });
      }
    });
});
// app.get("/movies/:id", function (req, res) {
//   movie.findById(req.params.id, function (err, foundmovie) {
//     if (err) {
//       console.log(err);
//     } else {
//       res.render("info", { movie: foundmovie });
//       console.log(foundmovie);
//     }
//   });
// });

app.get("/mymovies", function (req, res) {
  res.render("mymovies");
});

app.get("/movies/:id/comments/add", isLoggedIn, function (req, res) {
  movie.findById(req.params.id, function (err, foundmovie) {
    if (err) {
      console.log(err);
    } else {
      res.render("addcom", { movie: foundmovie });
    }
  });
});

app.post("/movies/:id/comments", isLoggedIn, function (req, res) {
  movie.findById(req.params.id, function (err, foundmovie) {
    if (err) {
      console.log(err);
    } else {
      comment.create(req.body.comment, function (err, comment) {
        if (err) {
          console.log(err);
        } else {
          foundmovie.comments.push(comment);
          foundmovie.save();
          res.redirect("/movies/" + foundmovie._id);
        }
      });
    }
  });
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  var newUser = new user({ username: req.body.username });
  user.register(newUser, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function () {
      res.redirect("/movies");
    });
  });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/movies",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/movies");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.listen(3000, function () {
  console.log("server started..");
});
