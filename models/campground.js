const mongoose = require('mongoose');

// SET SCHEMA
let campgroundSchema = new mongoose.Schema({
    name: String,
    cost: Number,
    image: String,
    description: String,
    created: {type: Date, default: Date.now},
    location: String,
    lat: Number,
    lng: Number,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
});

// EXPORT MODEL
module.exports = mongoose.model('Campground', campgroundSchema);
