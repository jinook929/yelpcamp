const express = require('express'),
    router = express.Router(),
    Campground = require('../models/campground'),
    Comment = require('../models/comment'),
    middleware = require('../middleware');

const NodeGeocoder = require('node-geocoder');

let options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

let geocoder = NodeGeocoder(options);

// INDEX
router.get('/', (req, res) => {
    Campground.find({}).sort({ created: -1 }).exec((err, allCampgrounds) => {
        if (err) {
            console.log(err);
        } else {
            res.render('campgrounds/index', { campgrounds: allCampgrounds, page: 'campgrounds' });
        }
    });
});

// NEW FORM 
router.get('/new', middleware.isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// CREATE NEW CAMPGROUND
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var cost = req.body.cost;
    geocoder.geocode(req.body.location, function (err, data) {
      if (err || !data.length) {
        console.log(err);
        req.flash('error', 'Invalid address');
        return res.redirect('back');
      }
    //   console.log(data[0].formattedAddress);
      var lat = data[0].latitude;
      var lng = data[0].longitude;
      var location = data[0].formattedAddress;
      var newCampground = {name: name, image: image, description: description, cost: cost, author:author, location: location, lat: lat, lng: lng};
      // Create a new campground and save to DB
      Campground.create(newCampground, function(err, newlyCreated){
          if(err){
              console.log(err);
          } else {
              //redirect back to campgrounds page
            //   console.log(newlyCreated);
            req.flash("success","Campground Successfully Created!");
            res.redirect("/campgrounds");
          }
      });
    });
  });

// SHOW
router.get('/:id', (req, res) => {
    Campground.findById(req.params.id).populate('comments').exec((err, foundCampground) => {
        if (err || foundCampground == undefined) {
            console.log(err);
            req.flash('error', 'Sorry, that campground does not exist!');
            return res.redirect('/campgrounds');
        } else {
            // console.log(foundCampground)
            res.render('campgrounds/show', { campground: foundCampground });
        }
    });
});

// EDIT FORM OF CAMPGROUND SHOW ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err) {
            console.log(err);
            req.flash('error', 'Sorry, that campground does not exist!');
            res.redirect('back');
        } else {
            res.render('campgrounds/edit', { campground: foundCampground });
        }
    });
});
// UPDATE CAMPGROUND SHOW ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
    geocoder.geocode(req.body.campground.location, function (err, data) {
        // console.log(req.body.campground);
        if (err || !data.length) {
            console.log(err)
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        // console.log(data);
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
            if (err) {
                req.flash("error", err.message);
                res.redirect('back');
            } else {
                req.flash("success","Successfully Updated!");
                res.redirect('/campgrounds/' + req.params.id);
            }
        });
    });
});
// DESTROY CAMPGROUD ROUTE
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
        if (err) {
            res.redirect('/campgrounds' + req.params.id);
        } else {
            Comment.deleteMany({ _id: { $in: campgroundRemoved.comments } }, (err) => {
                if (err) {
                    console.log(err);
                }
                req.flash('success', 'Campground deleted' );
                res.redirect("/campgrounds");
            });
        }
    });
});

module.exports = router;