const express = require("express");
const router = express.Router();
const pool = require("./pool");
const upload = require("./multer");
const fs = require("fs");
const path = require("path");

// 📌 Add New Category
router.post("/add_new_category", upload.single("icon"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ status: false, message: "No image uploaded" });
  }

  pool.query(
    "INSERT INTO category (categoryname, icon) VALUES (?, ?)",
    [req.body.categoryname, req.file.filename],
    (error, result) => {
      if (error) {
        console.error("Database error:", error);
        return res
          .status(500)
          .json({ status: false, message: "Database error" });
      }
      return res
        .status(200)
        .json({ status: true, message: "Category added successfully" });
    }
  );
});

// 📌 Display All Categories
router.get("/display_all_category", (req, res) => {
  pool.query("SELECT * FROM category", (error, result) => {
    if (error) {
      console.error("Database query error:", error);
      return res
        .status(500)
        .json({ data: [], message: "Failed to fetch categories" });
    }
    return res.status(200).json({ data: result });
  });
});

// 📌 Edit Category Data
router.post("/edit_category_data", (req, res) => {
  pool.query(
    "UPDATE category SET categoryname=? WHERE categoryid=?",
    [req.body.categoryname, req.body.categoryid],
    (error, result) => {
      if (error) {
        console.error("Update error:", error);
        return res
          .status(500)
          .json({ status: false, message: "Update failed" });
      }
      return res
        .status(200)
        .json({ status: true, message: "Category updated successfully" });
    }
  );
});

// 📌 Delete Category Data
router.post("/delete_category_data", (req, res) => {
  pool.query(
    "DELETE FROM category WHERE categoryid=?",
    [req.body.categoryid],
    (error, result) => {
      if (error) {
        console.error("Delete error:", error);
        return res
          .status(500)
          .json({ status: false, message: "Deletion failed" });
      }
      return res
        .status(200)
        .json({ status: true, message: "Category deleted successfully" });
    }
  );
});

// 📌 Update Category Icon
router.post("/update_icon", upload.single("icon"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ status: false, message: "No new image uploaded" });
  }

  const oldImagePath = path.join(
    __dirname,
    "../public/images/",
    req.body.oldpic
  );

  pool.query(
    "UPDATE category SET icon=? WHERE categoryid=?",
    [req.file.filename, req.body.categoryid],
    (error, result) => {
      if (error) {
        console.error("Icon update error:", error);
        return res
          .status(500)
          .json({ status: false, message: "Icon update failed" });
      }

      // 🛑 Check if old file exists before deleting
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      } else {
        console.warn("Old image not found:", oldImagePath);
      }

      return res
        .status(200)
        .json({ status: true, message: "Icon updated successfully" });
    }
  );
});

module.exports = router;
