const cheerio = require("cheerio");
const request = require("request");
const mongojs = require("mongojs");
const ObjectId = require("mongoose").Types.ObjectId;
const mongoose = require("mongoose");
const dbConnection = require("../config/config").connection;

// db.once("open", function() {
//     console.log("Database connected");
// })


let databaseUrl = "scraper";
let collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
//var db = mongojs(dbConnection, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

module.exports = function (app) {
    // Get all examples
    app.get("/api/headlines/notsaved", function (req, res) {
        db.scrapeData.find({ saved: false }, function (err, notSaved) {
            res.json(notSaved);
        });
        //console.log("/api/headlines?saved=false");
    });

    app.get("/api/headlines/saved", function (req, res) {
        db.scrapeData.find({ saved: true }, function (err, saved) {
            res.json(saved);
        });
        //console.log("/api/headlines?saved=false");
    });

    app.get("/api/fetch", function (req, res) {
        request("http://www.nytimes.com", function (error, response, html) {

            // Load the HTML into cheerio and save it to a variable
            // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
            var $ = cheerio.load(html);

            // An empty array to save the data that we'll scrape
            var results = [];

            // Select each element in the HTML body from which you want information.
            // NOTE: Cheerio selectors function similarly to jQuery's selectors,
            // but be sure to visit the package's npm page to see how it works
            $("h2.esl82me1").each(function (i, element) {

                // #site-content > div.css-1q91fy6.e6b6cmu0 > div.css-zygc9n > div.css-jbmajz > section > div:nth-child(2) > article > div > div > div.css-1yoguk1.eqveam60 > div > a
                if ($(element).parent().parent().attr("href") !== undefined) {
                    let url = "https://www.nytimes.com" + $(element).parent().parent().attr("href");
                    let headline = $(element).text();
                    let saved = false;
                    let summary = $(element).parent().next().text();
                    // Save these results in an object that we'll push into the results array we defined earlier
                    // results.push({
                    //     title: title,
                    //     link: link
                    // });
                    db.scrapeData.find({ headline: headline }, function (err, doc) {
                        if (doc.length === 0) {
                            if (summary !== "") {
                                db.scrapeData.insert({ headline, url, summary, saved });
                            }
                        }
                    });
                }
            });

            // Log the results once you've looped through each of the elements found with cheerio
            //console.log(results);
            res.send("Fetch Completed");
        });
        //   db.Example.findAll({}).then(function(dbExamples) {
        //     res.json(dbExamples);
        //   });
        //console.log("api fetch");
    });

    app.get("/api/clear", function (req, res) {
        db.scrapeData.remove();
        //   db.Example.findAll({}).then(function(dbExamples) {
        //     res.json(dbExamples);
        //   });
        res.send("cleared");
        //console.log("api clear");
    });

    app.put("/api/headlines/:id", function (req, res) {
        //console.log(req.body);
        //console.log(req.body.saved);
        //console.log(req.params.id);
        // db.scrapeData.update({"_id": ObjectId(req.params.id)}, {url: req.body.url}, {headline: req.body.headline}, {summary: req.body.summary}, {saved: req.body.saved});
        db.scrapeData.update({ "_id": ObjectId(req.params.id) }, { $set: { "saved": true } })
        // db.scrapeData.updateOne({"_id": ObjectId(req.params.id)}, {saved: true}, function(err, result) {
        //     res.json(result);
        // })
        //   db.Example.findAll({}).then(function(dbExamples) {
        //     res.json(dbExamples);
        //   });
        //console.log("api headlines/id");
    });

    app.get("/api/notes/:id", function (req, res) {
        db.scrapeData.find({ _id: ObjectId(req.params.id) }, function (err, data) {
            //console.log(data);
            //console.log(data[0].headline);
            //console.log(data[0].notes);
            res.send(data[0].notes);
        })
    })

    app.post("/api/notes", function (req, res) {
        //console.log(req.body);
        //console.log(req.body._headlineId);
        db.scrapeData.find({ _id: ObjectId(req.body._headlineId) }, function (err, data) {
            //console.log(data);
            let notes = data[0].notes;
            //console.log(notes);
            //console.log(data[0].headline);
            if (notes === undefined) {
                notes = [];
            }
            let newId = new mongoose.mongo.ObjectId();
            //let noteObj = [{_id: newId}, {noteText: req.body.noteText}]
            notes.push({ _id: newId, noteText: req.body.noteText });
            db.scrapeData.update({ "_id": ObjectId(req.body._headlineId) }, { $set: { "notes": notes } })
        });
        //db.scrapeData.update({"_id": ObjectId(req.params.id)})

        //console.log(req.body);

        //console.log("api headlines/id");
        res.send("Posted Complete");
    });

    app.delete("/api/notes/:id", function (req, res) {
        //console.log(req.params.id);
        //db.scrapeData.find({_id: ObjectId(req.params.id) }, function (err, data) {
        db.scrapeData.find({}, function (err, data) {
            //console.log(err);
            //console.log(data);
            for (let i = 0; i < data.length; i++) {
                let notes = data[i].notes;
                let headlineId = data[i]._id;
                if (notes !== undefined) {
                    let newNotes = [];
                    for (let m = 0; m < notes.length; m++) {
                        // console.log(typeof(req.params.id))
                        // console.log(typeof(notes[m]._id));
                        if (notes[m]._id != req.params.id) {
                            newNotes.push(notes[m])
                        }
                    }
                    db.scrapeData.update({"_id": headlineId }, { $set: { "notes": newNotes } })
                    res.send("note deleted")
                }
            }
        });
        //db.scrapeData.remove({ "_id": ObjectId(req.params.id) })

        //console.log("api headlines/id");
    });
}