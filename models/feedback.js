const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const feedbackSchema = new Schema ({
    rating:Number,
    comment: String,
    author:{
        type:Schema.Types.ObjectId,
        ref: "User",
    },
},

)
const Feedback = mongoose.model("Feedback",feedbackSchema);
module.exports = Feedback;