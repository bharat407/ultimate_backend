var express = require("express");
var router = express.Router();
var pool = require("./pool");
var upload = require("./multer");
var fs = require("fs");

// Add New Subcategory
router.post("/add_new_subcategory", upload.single("icon"), function (req, res) {
  console.log("Received Body:", req.body);
  console.log("Uploaded File:", req.file);

  if (!req.file) {
    return res.status(400).json({ result: false, error: "File upload failed" });
  }

  if (!req.body.categoryid || !req.body.subcategoryname) {
    return res
      .status(400)
      .json({ result: false, error: "Missing required fields" });
  }

  pool.query(
    "INSERT INTO subcategory (categoryid, subcategoryname, subcategoryicon, bannerpriority) VALUES (?, ?, ?, ?)",
    [
      req.body.categoryid,
      req.body.subcategoryname,
      req.file.filename,
      req.body.bannerpriority,
    ],
    function (error, result) {
      if (error) {
        console.log("SQL Error:", error);
        return res.status(500).json({ result: false, error });
      }
      return res.status(200).json({ result: true });
    }
  );
});

// Display All Subcategories
router.get("/display_all_subcategory", function (req, res) {
  pool.query(
    "SELECT S.*, (SELECT C.categoryname FROM category C WHERE C.categoryid=S.categoryid) AS categoryname FROM subcategory S",
    function (error, result) {
      if (error) {
        return res.status(500).json({ data: "" });
      }
      return res.status(200).json({ data: result });
    }
  );
});

// Edit Subcategory Data
router.post("/edit_subcategory_data", function (req, res) {
  pool.query(
    "UPDATE subcategory SET categoryid=?, subcategoryname=?, bannerpriority=? WHERE subcategoryid=?",
    [
      req.body.categoryid,
      req.body.subcategoryname,
      req.body.bannerpriority,
      req.body.subcategoryid,
    ],
    function (error, result) {
      if (error) {
        console.log("SQL Error:", error);
        return res.status(500).json({ status: false, error });
      }
      return res.status(200).json({ status: true });
    }
  );
});

// Delete Subcategory Data
router.post("/delete_subcategory_data", function (req, res) {
  pool.query(
    "DELETE FROM subcategory WHERE subcategoryid=?",
    [req.body.subcategoryid],
    function (error, result) {
      if (error) {
        return res.status(500).json({ status: false, error });
      }
      return res.status(200).json({ status: true });
    }
  );
});

// Update Subcategory Icon
router.post(
  "/update_icon",
  upload.single("subcategoryicon"),
  function (req, res) {
    if (!req.file) {
      return res
        .status(400)
        .json({ status: false, error: "File upload failed" });
    }

    pool.query(
      "UPDATE subcategory SET subcategoryicon=? WHERE subcategoryid=?",
      [req.file.filename, req.body.subcategoryid],
      function (error, result) {
        if (error) {
          return res.status(500).json({ status: false, error });
        }
        try {
          fs.unlinkSync("D:/ultimate_backend/public/images/" + req.body.oldpic);
        } catch (unlinkError) {
          console.log("Error deleting old file:", unlinkError);
        }
        return res.status(200).json({ status: true });
      }
    );
  }
);

// Fetch All Subcategories by Category ID
router.post("/fetch_all_subcategory", function (req, res) {
  console.log("Fetching subcategories for category:", req.body.categoryid);

  pool.query(
    "SELECT * FROM subcategory WHERE categoryid=?",
    [req.body.categoryid],
    function (error, result) {
      if (error) {
        console.log("SQL Error:", error);
        return res.status(500).json({ data: "" });
      }
      return res.status(200).json({ data: result });
    }
  );
});

module.exports = router;
