const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const ejs = require("ejs");
const Candidate = require("./models/candidate.js");
const Feedback = require("./models/feedback.js");
const User = require("./models/user.js")
const methodOverride = require("method-override");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const wrapAsync = require("./utils/wrapAsync.js")

const{isLoggedIn,isOwner,saveRedirectUrl,isFeedbackAuthor} = require("./middleware.js");



const MONGO_URL = 'mongodb://127.0.0.1:27017/candidate';

async function main(){
    try{
        console.log("connection is connected");
        await mongoose.connect(MONGO_URL);
    }
    catch(e){
        console.log("connection is not connected");
        console.log(e);
    }
}
main()
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs",ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));

const sessionOptions = {
    secret: "mysecrte",
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
      maxAge: 1000 * 60 * 60 * 60 * 3,
      httponly: true,
    },
  };
  app.use(session(sessionOptions));
  app.use(flash());

  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(User.authenticate()));
   passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  
  app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;

    next();
  });

  const validateCandidate = (req,res,next) => {
    let {error} =  candidateSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressErr(404,errMsg);
    }
    else
{
    next();
}    
}
const validateFeedback = (req,res,next) => {
  let {error} =  candidateSchema.validate(req.body);
  if(error){
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressErr(404,errMsg);
  }
  else
{
  next();
}    
}
app.get("/",(req,res) => {
    res.render("candidates/frontpage.ejs");
});

app.get("/candidates",async(req,res) => {
   const allcandidate =   await Candidate.find()
    res.render("candidates/index.ejs",{allcandidate});
});
app.get("/candidates/new",isLoggedIn,async(req,res) => {
  res.render("candidates/new.ejs");
})


app.post("/candidates",isLoggedIn,wrapAsync(async(req,res) => {
  let newCandidate = new Candidate(req.body.candidate);
  newCandidate.owner = req.user._id;
      await newCandidate.save();
      console.log("saved");
      res.redirect("/candidates");
      req.flash("success","you  created a new user profile");  
}));
app.get("/candidates/:id",async(req,res) => {
  let { id } = req.params;
    const candidate = await Candidate.findById(id)
    .populate({path: "feedbacks",
      populate: {
        path: "author",
      }
    
      }).populate("owner");
    if (!candidate) {
      req.flash("error", "candidate you requested doesnot existed");
      res.redirect("/candidates");
    }
    console.log(candidate);
    res.render("candidates/show.ejs", { candidate });
  });

app.get("/candidates/:id/edit",isLoggedIn,validateCandidate,isLoggedIn,async(req,res) => {
 let {id} = req.params;
 let candidate = await Candidate.findById(id);
 res.render("candidates/edit.ejs",{candidate});
})

app.put("/candidates/:id",isLoggedIn,isOwner,async(req,res) => {
    let {id} = req.params;
    await Candidate.findByIdAndUpdate(id,{...req.body.candidate});
    
    res.redirect("/candidates");
});

app.delete("/candidates/:id/delete",async(req,res) => {
    let {id} = req.params;
    const deleteCandidate = await Candidate.findByIdAndDelete(id);
    console.log(deleteCandidate);
    req.flash("success","Deleted successfully");
    res.redirect("/candidates")
});

app.post("/candidates/:id/feedbacks",isLoggedIn,async(req,res) => {
    let candidate = await Candidate.findById(req.params.id);
    let newFeedback = new Feedback(req.body.feedback);
    newFeedback.author = req.user._id;
    candidate.feedbacks.push(newFeedback);
    await newFeedback.save();
    await candidate.save();
    res.redirect("/candidates");
});
app.delete("/candidates/:id/feedbacks/:feedbackId",isLoggedIn,isFeedbackAuthor,async(req,res) => {
  let { id, feedbackId } = req.params;
  await Candidate.findByIdAndUpdate(id, { $pull: { feedbacks: feedbackId }});
  await Feedback.findByIdAndDelete(feedbackId);
  res.redirect(`/candidates/${id}`);
})


app.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
  });
  app.post("/signup",async(req,res,next) => {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registerUser = await User.register(newUser, password);
    console.log(registerUser);
    req.login(registerUser, (err) => {
        if (err) {
         return next(err);
        }
        
        res.redirect("/candidates");
    })
  });

  app.get("/login",(req,res) => {
    res.render("users/login.ejs");
  });

  app.post('/login', saveRedirectUrl,
  passport.authenticate('local', { failureRedirect: '/login' }),
  (req, res) => {
      let redirectUrl = res.locals.redirectUrl || "/candidates";
    res.redirect(redirectUrl); 
    req.flash("success","you are loggedin ")
  });
  
  app.post("/logout",(req,res,next) => {
    req.logout((err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/candidates");
        req.flash("success","you loggedout")
      });
  })
  app.all("*",(req,res,next) => {
    next( new ExpressErr(400,"page not found"));
})
app.use((err,req,res,next) => {
    let{status = 404, message = "something went wrong"} = err;
    res.status(status).render("error.ejs",{message});
})

app.listen(3000,(req,res) => {
    console.log("listening to 3000");
})