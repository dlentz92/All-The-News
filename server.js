var express = require("express");
var mongoose = require("mongoose");
var colors = require("colors")
var cheerio = require("cheerio");
var axios = require("axios");

var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/newsscrape", { useNewUrlParser: true });

// First, tell the console what server.js is doing
console.log("\n***********************************\n" +
  "Grabbing every thread name and link\n" +
  "from reddit's webdev board:" +
  "\n***********************************\n");

// Making a request via axios for reddit's "webdev" board. We are sure to use old.reddit due to changes in HTML structure for the new reddit. The page's Response is passed as our promise argument.
app.get("/scrape", function (req, res) {
  axios.get("https://www.nytimes.com/section/books").then(function (response) {
    //console.log(response.data)
    // Load the Response into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(response.data);

    // An empty array to save the data that we'll scrape
    var results = [];

    // With cheerio, find each p-tag with the "title" class
    // (i: iterator. element: the current element)
    $("article").each(function (i, element) {

      // Save the text of the element in a "title" variable
      var headline = $(element).find(".css-171kk9w").children().text();

      // In the currently selected element, look at its child elements (i.e., its a-tags),
      // then save the values for any "href" attributes that the child elements may have
      var summary = $(element).find(".css-1gh531").text();

      var url = $(element).find(".css-171kk9w").children().attr("href");
      console.log("THE INFO:".red, headline, summary, url)
      var articleEntry = {
        headline: headline,
        summary: summary,
        url: "https://www.nytimes.com/" + url
      }
      if (!summary){
      db.Article.create(articleEntry, function (res) {
        console.log("------".red, res)
        console.log("added to the database");
       results.push(articleEntry);
       //console.log("*****".red, results);
      })
    }

    });
    // Save these results in an object that we'll push into the results array we defined earlier



  // Log the results once you've looped through each of the elements found with cheerio
  console.log(results);
});
})


// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});