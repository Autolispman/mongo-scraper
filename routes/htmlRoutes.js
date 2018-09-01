module.exports = function(app) {
    // Load index page
    app.get("/", function(req, res) {
      res.render("index", {
        msg: "Welcome!"
      });
    });
    app.get("/saved", function(req, res) {
        // res.render("index", {
        //   msg: "Welcome!"
        // });
        res.render("saved")
        //console.log("saved")
      });
}