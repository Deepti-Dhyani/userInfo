const Candidate = require("./models/candidate");
const Feedback = require("./models/feedback");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
   return res.redirect("/login");
  }
  next(); 
};
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};
module.exports.isOwner = async(req,res,next) => {
    let { id } = req.params;
      let candidate = await Candidate.findById(id);
      if (!candidate.owner.equals(res.locals.currUser._id)) {
        
       return  res.redirect(`/candidates/${id}`);
      }
      next();
  };

  module.exports.isFeedbackAuthor = async(req,res,next) => {
    let { id, feedbackId } = req.params;
      let feedback = await Feedback.findById(feedbackId);
      if (!feedback.author._id.equals(res.locals.currUser._id)) {
        return  res.redirect(`/candidates/${id}`);
      }
      next();
  };