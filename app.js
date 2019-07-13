var express                 = require("express"),
    app                     = express(),
    mongoose                =require("mongoose"),
    passport                =require("passport"),
    bodyParser              =require("body-parser"),
    LocalStrategy           =require("passport-local"),
    User                    =require("./models/user"),
    passportLocalMongoose   =require("passport-local-mongoose");


mongoose.connect("mongodb://localhost/auth_app");

app.use(express.static(__dirname + '/public'));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
   secret:"secret",
   resave:false,
   saveUninitialized:false

}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//=====   ROUTES ===////
app.get("/",function(req,res){
  res.render("home");
});


app.get("/secret",isLoggedIn,function(req,res){
  res.render("secret");
});

//=== AUTH ROUTES ===//
app.get("/register",function(req,res){
   res.render("register");
});


// handling user sign up 
app.post("/register",function(req,res){

   User.register(new User({username: req.body.username}),req.body.password,function(err,user){
   if(err)
   {
   	console.log(err);
   	return res.render("register");
   }
   else
   {
   	passport.authenticate("local")(req,res,function(){
        res.redirect("/secret");
   	});
   }
   });
});

//=== LOGIN ROUTES ===//
app.get("/login",function(req,res){
  res.render("login");
});

app.post("/login",passport.authenticate("local",{
      successRedirect:"/secret",
      failureRedirect:"/login"
}), function(req,res){
});


//== logout routes  ==//
app.get("/logout",function(req,res){
  req.logout();
   res.redirect("/");
});


function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
	{
		return next();
	}
	return res.redirect("/login");
}

app.listen(3000,process.env.IP,function(){
   console.log("Server is running at port 3000...");
});