const express = require('express'),
    router = express.Router({ mergeParams: true }),
    Campground = require('../models/campground'),
    Comment = require('../models/comment'),
    middleware = require('../middleware');

// NEW COMMENT
router.get('/new', middleware.isLoggedIn, (req, res) => {
    // console.log(req.params.id);
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
        } else {
            res.render('comments/new', { campground: campground });
        }
    });
});
// CREATE COMMENT
router.post('/', middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect('/campgrounds');
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash('error', 'Campground not found');
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    // console.log(comment);
                    req.flash('success', 'Comment successfully added');
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

// EDIT COMMENT FORM
router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComment)=>{
        if(err){
            res.redirect('back');
        } else {
            res.render('comments/edit', {campground_id: req.params.id, comment: foundComment});
        }
    });
});
// UPDATE COMMENT
router.put('/:comment_id', middleware.checkCommentOwnership, (req, res)=>{
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment)=>{
        if(err){
            res.redirect('back');
        } else {
            req.flash('success', 'Comment edited');
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

// DESTROY COMMENT ROUTE
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err, commentRemoved) => {
        if (err) {
            res.redirect('back');
        } else {
            req.flash('success', 'Comment deleted' );
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

module.exports = router;