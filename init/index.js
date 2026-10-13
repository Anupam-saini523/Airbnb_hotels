const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");



async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    console.log("connected to DB");

    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,
         owner:new mongoose.Types.ObjectId("6aa37a3dbfc5e580842ac47f")}));
    await Listing.insertMany(initData.data);

    console.log("data was initialized");

    await mongoose.connection.close();
}

main().catch((err) => {
    console.log(err);
});