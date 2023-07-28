require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ =require("lodash");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret:"Our little secret.",
  resave:false,
  saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());
mongoose.set('strictQuery',true);
mongoose.connect("mongodb+srv://aman13nagar:Aaman@cluster0.zecfzcz.mongodb.net/ourDB",{useNewUrlParser:true});
const userSchema= new mongoose.Schema({
  username:String,
  email:String,
  password:String
});
const postSchema={
  title:String,
  content:String
}
userSchema.plugin(passportLocalMongoose);
const User=new mongoose.model("User",userSchema);
const Post=new mongoose.model("Post",postSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user,done){
    done(null,user.id);
});

passport.deserializeUser(function(id,done){
    User.findById(id,function(err,user){
        done(err,user);
    })
});
app.get("/",function(req,res){
  res.render("home-guest");
})
app.get("/Create-post",function(req,res){
  res.render("Create-post");
})
var usercrio;
app.post("/",function(req,res){
  User.register({username:req.body.username,email:req.body.mail},req.body.password,function(err,user){
    usercrio=req.body.username;
    if(err){
        console.log(err);
        res.redirect("/");
    }
    else{
        passport.authenticate("local")(req,res,function(){
        res.render("home-dashboard",{user:usercrio});
        })
    }
})
})
app.post("/home-guestlogin",function(req,res){
  const user=new User({
    username:req.body.username,
    password:req.body.password,
    email:req.body.mail
})
usercrio=user.username;
req.login(user,function(err){
    if(err){
        console.log(err);
        res.redirect("/home-guest");
    }else{
        passport.authenticate("local")(req,res,function(){
            res.render("home-dashboard",{user:usercrio});
        })
    }
})
})
app.get("/home-dashboard",function(req,res){
  res.render("home-dashboard",{user:usercrio});
})
app.get("/Profile",function(req,res){
  res.render("Profile",{user:usercrio});
})
app.get("/single-post",function(req,res){
  Post.find({},function(err, posts){
    res.render("single-post", {
      posts: posts,
      });
  })
})
app.post("/Create-post",function(req,res){
  const post=new Post({
    title:req.body.postTitle,
    content:req.body.PostBody,
  });
  post.save(function(err){
    if (!err){
        res.redirect("/single-post");
    }
  });
})
app.post("/Delete",function(req,res){
  const checkeditemid=req.body.checkbox;
  Post.findByIdAndRemove(checkeditemid).then(function(){
        res.redirect("/single-post");
      }).catch(function(err){
          if(!err){
              console.log("Successfully deleted the checked item");
          }
      })
})
app.post('/home-dashboard', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
