var express = require("express");
var router = express.Router();
var pool = require("./pool"); // Database connection
var upload = require("./multer"); // Multer for file uploads
var fs = require("fs");
var path = require("path");

// ✅ Add New Product
router.post("/add_new_product", upload.single("icon"), function (req, res) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ status: false, error: "File upload failed" });
    }

    const query = `INSERT INTO products (categoryid, subcategoryid, productname, price, offerprice, stock, description, rating, status, salestatus, icon) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      req.body.categoryid,
      req.body.subcategoryid,
      req.body.productname,
      req.body.price,
      req.body.offerprice,
      req.body.stock,
      req.body.description,
      req.body.rating,
      req.body.status,
      req.body.salestatus,
      req.file.filename,
    ];

    pool.query(query, values, function (error, result) {
      if (error)
        return res.status(500).json({ status: false, error: error.message });
      res
        .status(200)
        .json({ status: true, message: "Product added successfully" });
    });
  } catch (err) {
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
});

// ✅ Display All Products with Category & Subcategory Names
router.get("/display_all_product", function (req, res) {
  const query = `SELECT P.*, 
                (SELECT C.categoryname FROM category C WHERE C.categoryid = P.categoryid) AS categoryname, 
                (SELECT S.subcategoryname FROM subcategory S WHERE S.subcategoryid = P.subcategoryid) AS subcategoryname
                FROM products P`;
  pool.query(query, function (error, result) {
    if (error) return res.status(500).json({ data: "", error: error.message });
    res.status(200).json({ data: result });
  });
});

// ✅ Edit Product Data
router.post("/edit_product_data", function (req, res) {
  const query = `UPDATE products 
                 SET categoryid=?, subcategoryid=?, productname=?, price=?, offerprice=?, stock=?, description=?, rating=?, status=?, salestatus=?
                 WHERE productid=?`;
  const values = [
    req.body.categoryid,
    req.body.subcategoryid,
    req.body.productname,
    req.body.price,
    req.body.offerprice,
    req.body.stock,
    req.body.description,
    req.body.rating,
    req.body.status,
    req.body.salestatus,
    req.body.productid,
  ];
  pool.query(query, values, function (error, result) {
    if (error)
      return res.status(500).json({ status: false, error: error.message });
    res
      .status(200)
      .json({ status: true, message: "Product updated successfully" });
  });
});

// ✅ Delete Product
router.post("/delete_product_data", function (req, res) {
  const query = "DELETE FROM products WHERE productid = ?";
  pool.query(query, [req.body.productid], function (error, result) {
    if (error)
      return res.status(500).json({ status: false, error: error.message });
    res
      .status(200)
      .json({ status: true, message: "Product deleted successfully" });
  });
});

// ✅ Update Product Icon
router.post("/update_icon", upload.single("icon"), function (req, res) {
  if (!req.file)
    return res.status(400).json({ status: false, error: "File upload failed" });

  pool.query(
    "SELECT icon FROM products WHERE productid = ?",
    [req.body.productid],
    function (err, result) {
      if (err)
        return res.status(500).json({ status: false, error: err.message });
      if (result.length > 0 && result[0].icon) {
        const oldImagePath = path.join(
          __dirname,
          "public/images/",
          result[0].icon
        );
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }

      const query = "UPDATE products SET icon = ? WHERE productid = ?";
      pool.query(
        query,
        [req.file.filename, req.body.productid],
        function (error, result) {
          if (error)
            return res
              .status(500)
              .json({ status: false, error: error.message });
          res.status(200).json({
            status: true,
            message: "Product icon updated successfully",
          });
        }
      );
    }
  );
});

// ✅ Fetch Products by Category & Subcategory
router.post("/fetch_all_product", function (req, res) {
  const query =
    "SELECT * FROM products WHERE categoryid = ? AND subcategoryid = ?";
  pool.query(
    query,
    [req.body.categoryid, req.body.subcategoryid],
    function (error, result) {
      if (error)
        return res.status(500).json({ data: "", error: error.message });
      res.status(200).json({ data: result });
    }
  );
});

// ✅ Add Product Images
router.post(
  "/add_product_images",
  upload.array("picture", 10),
  function (req, res) {
    try {
      if (!req.files || req.files.length === 0)
        return res
          .status(400)
          .json({ status: false, error: "No files uploaded" });

      const { productid, categoryid, subcategoryid } = req.body;
      if (!productid || !categoryid || !subcategoryid)
        return res
          .status(400)
          .json({ status: false, error: "Missing product details" });

      let imagePaths = req.files.map((file) => file.filename).join(",");
      const query = `INSERT INTO productimages (categoryid, subcategoryid, productid, productimages) 
                   VALUES (?, ?, ?, ?) 
                   ON DUPLICATE KEY UPDATE productimages = CONCAT(productimages, ',', VALUES(productimages))`;

      pool.query(
        query,
        [categoryid, subcategoryid, productid, imagePaths],
        function (error, result) {
          if (error)
            return res
              .status(500)
              .json({ status: false, error: error.message });
          res
            .status(200)
            .json({ status: true, message: "Images uploaded successfully!" });
        }
      );
    } catch (err) {
      res.status(500).json({ status: false, error: "Internal Server Error" });
    }
  }
);

module.exports = router;
