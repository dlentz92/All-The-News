var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require('mongoose');
var PORT = process.env.PORT || 8080;

// Initialize Express
var app = express();
// Configure middleware
var routes = require("./controller/controller");

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(routes);

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsscrape" ;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});