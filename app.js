var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var movie = require("./models/movie");
var seedDB = require("./seeds");
var comment = require("./models/comment");
var user = require("./models/user");
var mymovie = require("./models/mymovies");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride=require("method-override")
mongoose.connect("mongodb://localhost/moviedb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// seedDB();

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
app.use(methodOverride("_method"));
app.post("/movies", isLoggedIn, function (req, res) {
  var addname = req.body.name;
  var addimage = req.body.image;
  var moviesobj = { name: addname, image: addimage };

  movie.create(moviesobj, function (err, movies) {
    if (err) {
      console.log("err");
    } else {
      movies.author.id=req.user._id;
      movies.author.username=req.user.username;
      movies.save();

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
app.delete("/movies/:id",function(req,res){
  movie.findByIdAndDelete(req.params.id,function(err){
    if(err)
    {
      console.log("err");
    }else{
      res.redirect("/movies");
    }

  })
})
app.get("/mymovies",isLoggedIn, function (req, res) {
  mymovie.find({userid:req.user._id},function(err,mymovielist){
if(err){
  console.log("err");

}else{
  res.render("mymovies",{movies:mymovielist});
}
  })
  
});
app.get("/mymovies/myadd",isLoggedIn, function (req, res) {
  
  res.render("myadd");
});
app.post("/mymovies",isLoggedIn, function (req, res) {
  var addname = req.body.name;
  var addimage = req.body.image;
  var moviesobj = { name: addname, image: addimage };

  mymovie.create(moviesobj, function (err, mymovies) {
    if (err) {
      console.log("err");
    } else {
      mymovies.userid=req.user._id;
      
      mymovies.save();

      res.redirect("/mymovies");
    }
  });
});

app.delete("/mymovies",isLoggedIn, function (req, res) {
 
  var name=req.body.name;

  mymovie.findOneAndDelete({name:name,userid:req.user._id},function(err){
    if(err){
res.redirect("/mymovies");
    }
    else{
      res.redirect("/mymovies");
    }

  })
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
          comment.author.id=req.user._id;
          comment.author.username=req.user.username;
          comment.save();

          foundmovie.comments.push(comment);
          foundmovie.save();
          res.redirect("/movies/" + foundmovie._id);
        }
      });
    }
  });
});
app.delete("/:id/:commentid",isLoggedIn, function (req, res) {
 console.log();
 
comment.findByIdAndRemove(req.params.commentid,function(err){
  if(err){
    console.log("err");

  }
  else{
    res.redirect("/movies/"+req.params.id);
  }
})

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
