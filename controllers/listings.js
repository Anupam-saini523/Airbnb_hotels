const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index = async (req, res) => {
    const { category, search } = req.query;

    let filter = {};

    // Category filter
    if (category) {
        filter.category = category;
    }

    // Search filter
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } }
        ];
    }
    const alllistings = await Listing.find(filter);
    res.render("index.ejs", { alllistings
        ,search
     });
};

module.exports.renderNewForm = (req, res) => {
    res.render("new.ejs");

}

module.exports.showListing = async (req, res) => {
     let { id } = req.params;
     const listing = await Listing.findById(id)
     .populate({path:"reviews", populate:{path:"author"}})
     .populate("owner");
    if(!listing){
        rew.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings")
    }
    res.render("show.ejs", { listing });

}

module.exports.createListing = async (req, res) => {
   let response = await geocodingClient.forwardGeocode({
        query:req.body.listing.location,
        limit:1
    })
    .send();
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    newListing.geometry = response.body.features[0].geometry;
let savedListing =await newListing.save();
console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
     id = id.trim();
   const listing = await Listing.findById(id);
   let originalImageUrl = listing.image.url;
   originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250")
res.render("edit.ejs", { listing, originalImageUrl });

}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
     listing.image = { url, filename };
      await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

    module.exports.deleteListing = async (req, res) => {
           let { id } = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
            console.log(deleteListing);
            req.flash("success", "Listing Deleted!");
         res.redirect("/listings");
    
    }

    