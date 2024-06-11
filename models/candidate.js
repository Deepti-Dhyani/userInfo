const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const candidateSchema = new Schema({
    name: String,
    email:String,
    phone:Number,
    dob: Date,
    occupation: String,
    address: String,
    gender:String,
    image:
    { 
        type: String,
    default : "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    set: (v) => v === "" ? "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v,
},

    feedbacks:[
        {
        type:Schema.Types.ObjectId,
        ref : "Feedback"
    }
],
owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
},
})

const Candidate = mongoose.model("Candidate",candidateSchema);
module.exports = Candidate;