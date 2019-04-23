require('dotenv').config();

const express           = require('express'),
      app               = express(),
      bodyParser        = require('body-parser'),
      mongoose          = require('mongoose'),
      flash             = require('connect-flash'),
      passport          = require('passport'),
      LocalStrategy     = require('passport-local'),
      methodOverride    = require('method-override'),
      Campground        = require('./models/campground'),
      Comment           = require('./models/comment'),
      User              = require('./models/user'),
      seedDB            = require('./seeds');

// REQUIRING ROUTES
const indexRoutes = require('./routes/index'),
      campgroundRoutes = require('./routes/campgrounds'),
      commentRoutes = require('./routes/comments');

mongoose.Promise = global.Promise;

// console.log(process.env.MONGODB_URI)

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .then(()=> console.log('Database connected!!!'))
    .catch((err)=> console.log('Database connection error: ${err.message'));
// mongoose.connect('mongodb://localhost/yelp_camp', { useNewUrlParser: true });

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
app.locals.moment = require('moment'),

// Seed the DB ==================
// seedDB();

// PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: 'God is good all the time!',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// GLOBAL USE SETTING (LOGIN STATUS / FLASH MESSAGE)
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// USE ROUTES
app.use('/', indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

// SERVER LISTENING
app.listen(process.env.PORT || 3000, process.env.IP, () => {
    console.log('The YelpCamp server has started on PORT 3000!!!');
});