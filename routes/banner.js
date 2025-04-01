var express = require("express");
var router = express.Router();
var pool = require("./pool");
var upload = require("./multer");

// ✅ Upload Banner Images - Fixed
router.post(
  "/add_new_pictures",
  upload.array("picture", 5),
  function (req, res) {
    console.log("Uploaded Files:", req.files);

    if (!req.files || req.files.length === 0) {
      console.error("No files received");
      return res
        .status(400)
        .json({ status: false, message: "No files uploaded" });
    }

    var banners = req.files.map((item) => item.filename);
    console.log("Saving to DB:", banners);

    pool.query(
      "INSERT INTO banners (bannerpictures) VALUES (?)",
      [JSON.stringify(banners)], // Ensure it's saved as JSON string
      function (error, result) {
        if (error) {
          console.error("Database Insert Error:", error);
          return res
            .status(500)
            .json({ status: false, error: error.sqlMessage || error.message });
        }
        return res.status(200).json({
          status: true,
          message: "Banners uploaded successfully",
          result,
        });
      }
    );
  }
);

// ✅ Get All Banners - Fixed JSON Handling
router.get("/display_all_banners", function (req, res) {
  pool.query("SELECT bannerpictures FROM banners", function (error, result) {
    if (error) {
      console.error("Database Fetch Error:", error.sqlMessage || error);
      return res.status(500).json({ status: false, error: error.sqlMessage });
    }
    if (result.length > 0) {
      try {
        let banners = result.map((row) => JSON.parse(row.bannerpictures)); // Fix JSON Parsing
        return res.status(200).json({ status: true, data: banners.flat() });
      } catch (error) {
        console.error("JSON Parsing Error:", error);
        return res
          .status(500)
          .json({ status: false, message: "Error parsing banner data" });
      }
    }
    return res.status(404).json({ status: false, message: "No banners found" });
  });
});

module.exports = router;
