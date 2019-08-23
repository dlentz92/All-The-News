var express = require("express");

var mongoose = require("mongoose");
var colors = require("colors")
var cheerio = require("cheerio");
var axios = require("axios");
var router = express.Router();

var db = require("../models");


// router.get("/", function (req, res) {
//     res.render("index");
// });
// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/newsscrape", { useNewUrlParser: true });

// Making a request via axios for reddit's "webdev" board. We are sure to use old.reddit due to changes in HTML structure for the new reddit. The page's Response is passed as our promise argument.
router.get("/scrape", function (req, res) {
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
            //var headline = $(element).find(".css-171kk9w").children().text();
            var headline = $(element).find("h2").children().text();

            // In the currently selected element, look at its child elements (i.e., its a-tags),
            // then save the values for any "href" attributes that the child elements may have
            var summary = $(element).find("p").text();

            var url = $(element).find("h2").children().attr("href");
            console.log("THE INFO:".red, headline, summary, url)
            var articleEntry = {
                headline: headline,
                summary: summary,
                url: "https://www.nytimes.com/" + url
            }
            console.log("article: ".blue, articleEntry)
            // if (summary) {
            db.Article.create(articleEntry)
                .then(function (dbArticle) {
                    console.log("------".red, dbArticle)
                    console.log("added to the database".blue);

                    //results.push(articleEntry);
                    //console.log("*****".red, results);
                })
                .catch(function (err) {
                    //  If an error occurred, send it to the client
                    console.log("error".red, err)
                    res.json(err);
                });
            //}

        });
        // Save these results in an object that we'll push into the results array we defined earlier



        // Log the results once you've looped through each of the elements found with cheerio
        //console.log(results);
        res.send("Scrape Complete")
    });
})

// Route for getting all Articles from the db
router.get("/", function (req, res) {
    // Grab every document in the Articles collection
    console.log("path root".red)
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            var obj = {
                articles: dbArticle
            }
            console.log("OBJ".blue, obj)
            res.render("index", obj);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// COMMENT PORTION
router.post("/comment/:id", function (req, res) {
    var user = req.body.name;
    var content = req.body.comment;
    var articleID = req.params.id;

    var commentObj = {
        name: user,
        body: content
    };

    var newComment = new Comment(commentobj);

    newComment.save(function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log(doc._id);
            console.log(articleID);

            Article.findOneAndUpdate(
                { id: req.params.id },
                { $push: { comment: doc._id } },
                { new: true }
            ).exec(function (err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/readArticle/" + articleID)
                }
            });
        }
    });
});

module.exports = router;