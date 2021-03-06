var express = require("express");
var cheerio = require("cheerio");
var axios = require("axios");
var router = express.Router();

var db = require("../models");

router.get("/scrape", function (req, res) {
    axios.get("https://www.nytimes.com/section/books").then(function (response) {

        var $ = cheerio.load(response.data);

        // An empty array to save the data that we'll scrape]
        // (i: iterator. element: the current element)
        $("article").each(function (i, element) {

            var headline = $(element).find("h2").children().text();

            var summary = $(element).find("p").text();

            var url = $(element).find("h2").children().attr("href");
            console.log("THE INFO:".red, headline, summary, url)
            var articleEntry = {
                headline: headline,
                summary: summary,
                url: "https://www.nytimes.com/" + url
            }
            console.log("article: ".blue, articleEntry)
   
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
        });

        // Log the results once you've looped through each of the elements found with cheerio
        //console.log(results);
        res.send("Scrape Complete")
    });
})

// BUILD ROUTES TO CLEAR AND SAVE ARTICLES
// SIMILAR TO THE BELOW
// WITHIN THE FUNCTION I'LL BE ABLE TO SCRAPE OR CLEAR

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

router.get("/articles", function (req, res) {
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

    var newComment = new Comment(commentObj);

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