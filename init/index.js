const mongoose = require("mongoose");
const initData = require("./data.js");
const Candidate = require("../models/candidate.js");


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


const initDB = async(req,res) => {
    initData.data = initData.data.map((obj) => ({...obj, owner: "6668543eaff179bb8538b1e0"}));
   await Candidate.insertMany(initData.data);
console.log("data is initialised");
}
initDB()
