var express = require("express");
var exphbs = require("express-handlebars");

var PORT = process.env.PORT || 8080;

// Initialize Express
var app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

var routes = require("./controller/controller");

app.use(routes);



// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});