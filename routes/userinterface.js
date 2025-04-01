var express = require("express");
var router = express.Router();
var pool = require("./pool");

router.get("/display_all_category", function (req, res) {
  pool.query("select * from category", function (error, result) {
    if (error) {
      return res.status(500).json({ data: [] });
    } else {
      console.log("xxxxxxxxxxxxxx", result);
      return res.status(200).json({ data: result });
    }
  });
});

router.post("/display_all_subcategory", function (req, res) {
  pool.query(
    "select * from subcategory where categoryid=?",
    [req.body.categoryid],
    function (error, result) {
      if (error) {
        return res.status(500).json({ data: [] });
      } else {
        console.log("xxxxxxxxxxxxxx", result);
        return res.status(200).json({ data: result });
      }
    }
  );
});

router.get("/display_all_banners", function (req, res) {
  pool.query("select * from banners", function (error, result) {
    if (error) {
      return res.status(500).json({ data: [] });
    } else {
      console.log("RESULT:", result);
      return res.status(200).json({ data: result[0] });
    }
  });
});

router.post("/display_all_product_salestatus", function (req, res) {
  const { salestatus } = req.body;
  
  if (!salestatus) {
    return res.status(400).json({ error: "Missing salestatus parameter" });
  }

  pool.query(
    `SELECT P.*, 
            (SELECT C.categoryname FROM category C WHERE C.categoryid = P.categoryid) AS categoryname, 
            (SELECT S.subcategoryname FROM subcategory S WHERE S.subcategoryid = P.subcategoryid) AS subcategoryname 
     FROM products P 
     WHERE P.salestatus = ?`,
    [salestatus],
    function (error, result) {
      if (error) {
        console.error("Database Error:", error);  // Log the actual error
        return res.status(500).json({ error: "Internal Server Error" });
      } else {
        console.log("Query Result:", result);
        return res.status(200).json({ data: result });
      }
    }
  );
});


router.post("/display_all_subcategory_by_priority", function (req, res) {
  pool.query(
    "select S.*,(select C.categoryname from category C where C.categoryid=S.categoryid) as categoryname from subcategory S where S.bannerpriority=?",
    [req.body.priority],
    function (error, result) {
      if (error) {
        return res.status(500).json({ data: "" });
      } else {
        return res.status(200).json({ data: result });
      }
    }
  );
});

router.post("/fetch_all_product_by_subcategory", function (req, res) {
  pool.query(
    "select * from products  where subcategoryid=?",
    [req.body.subcategoryid],
    function (error, result) {
      if (error) {
        console.log("Error:", error);
        return res.status(500).json({ data: "" });
      } else {
        return res.status(200).json({ data: result });
      }
    }
  );
});

router.post("/display_all_size_by_productid", function (req, res) {
  pool.query(
    "select ss.*,(select C.categoryname from category C where C.categoryid=ss.categoryid) as cn,(select S.subcategoryname from subcategory S where S.subcategoryid=ss.subcategoryid) as sn,(select P.productname from products P where P.productid=ss.productid) as pn from size ss where ss.productid=?",
    [req.body.productid],
    function (error, result) {
      if (error) {
        console.log("xxxxxxxxxx", error);
        return res.status(500).json({ data: "" });
      } else {
        return res.status(200).json({ data: result });
      }
    }
  );
});

router.post("/display_all_color_by_size", function (req, res) {
  pool.query(
    "select * from color where productid=? and size=?",
    [req.body.productid, req.body.size],
    function (error, result) {
      if (error) {
        console.log("xxxxxxxxxx", error);
        return res.status(500).json({ data: "" });
      } else {
        return res.status(200).json({ data: result });
      }
    }
  );
});

router.post("/display_all_color_by_productid", function (req, res) {
  pool.query(
    "select * from color where productid=?",
    [req.body.productid],
    function (error, result) {
      if (error) {
        console.log("xxxxxxxxxx", error);
        return res.status(500).json({ data: "" });
      } else {
        return res.status(200).json({ data: result });
      }
    }
  );
});

// Updated /fetchallpictures endpoint with validation
router.post("/fetchallpictures", function (req, res) {
  // Validate required parameters
  const requiredParams = ["categoryid", "subcategoryid", "productid"];
  const missingParams = requiredParams.filter((param) => !req.body[param]);

  if (missingParams.length > 0) {
    return res.status(400).json({
      error: `Missing required parameters: ${missingParams.join(", ")}`,
    });
  }

  const query = `
    SELECT productimages 
    FROM productimages 
    WHERE categoryid = ? 
      AND subcategoryid = ? 
      AND productid = ?
  `;

  pool.query(
    query,
    [req.body.categoryid, req.body.subcategoryid, req.body.productid],
    function (error, result) {
      if (error) {
        console.error("❌ SQL Error:", error);
        return res.status(500).json({ error: error.message });
      }

      if (!result || result.length === 0) {
        return res.status(404).json({ data: [], message: "No images found." });
      }

      try {
        const images = result[0].productimages.split(",");
        console.log("✅ Fetched Images:", images);
        return res.status(200).json({ data: images });
      } catch (parseError) {
        console.error("❌ Data Processing Error:", parseError);
        return res.status(500).json({ error: "Invalid image data format" });
      }
    }
  );
});

router.post("/check_user_mobilenumber", function (req, res, next) {
  pool.query(
    "select * from users where mobilenumber=?",
    [req.body.mobilenumber],
    function (error, result) {
      if (error) {
        console.log(error);
        return res.status(500).json({ data: [], status: false });
      } else {
        if (result.length == 1)
          return res.status(200).json({ data: result[0], status: true });
        else return res.status(200).json({ data: [], status: false });
      }
    }
  );
});

router.post("/submit_userdata", function (req, res) {
  pool.query(
    "insert into users(mobilenumber,emailid,firstname,lastname,dateofbirth,gender)  values(?,?,?,?,?,?)",
    [
      req.body.mobilenumber,
      req.body.emailid,
      req.body.firstname,
      req.body.lastname,
      req.body.dob,
      req.body.gender,
    ],
    function (error, result) {
      if (error) {
        console.log("xxxxxxxxxx", error);
        return res.status(500).json({ message: "Server Error", status: false });
      } else {
        return res
          .status(200)
          .json({ message: "Submitted....!!", status: true });
      }
    }
  );
});

router.post("/submit_useraddress", function (req, res) {
  pool.query(
    "insert into useraddress(userid,pincode,town,city,state,address)  values(?,?,?,?,?,?)",
    [
      req.body.userid,
      req.body.pincode,
      req.body.town,
      req.body.city,
      req.body.state,
      req.body.address,
    ],
    function (error, result) {
      if (error) {
        console.log("xxxxxxxxxx", error);
        return res.status(500).json({ message: "Server Error", status: false });
      } else {
        return res
          .status(200)
          .json({ message: "Submitted....!!", status: true });
      }
    }
  );
});

router.post("/check_user_address", function (req, res, next) {
  pool.query(
    "select * from useraddress where userid=?",
    [req.body.userid],
    function (error, result) {
      if (error) {
        console.log(error);
        return res.status(500).json({ data: [], status: false });
      } else {
        if (result.length >= 1)
          return res.status(200).json({ data: result, status: true });
        else return res.status(200).json({ data: [], status: false });
      }
    }
  );
});

router.post("/update_useraddress", function (req, res) {
  pool.query(
    "update useraddress set pincode=?,town=?,city=?,state=?,address=? where userid=?",
    [
      req.body.pincode,
      req.body.town,
      req.body.city,
      req.body.state,
      req.body.address,
      req.body.userid,
    ],
    function (error, result) {
      if (error) {
        console.log("xxxxxxxxxx", error);
        return res.status(500).json({ message: "Server Error", status: false });
      } else {
        return res.status(200).json({ message: "Updated....!!", status: true });
      }
    }
  );
});

router.post("/submit_orders", function (req, res) {
  pool.query(
    "insert into orders(orderdate,userid,mobilenumber,emailid)  values(?,?,?,?)",
    [
      req.body.orderdate,
      req.body.userid,
      req.body.mobilenumber,
      req.body.emailid,
    ],
    function (error, result) {
      if (error) {
        console.log("xxxxxxxxxx", error);
        return res.status(500).json({ message: "Server Error", status: false });
      } else {
        console.log("Result:", result);
        console.log("Products:", req.body.products);

        var q = "insert into orderdetails(orderid,productid,qty) values(?)";
        pool.query(
          q,
          Object.values(req.body.products).map((item) => {
            return [result.insertId, item.productid, item.qty];
          }),
          function (err, rslt) {
            if (err) {
              return res
                .status(500)
                .json({ message: "Server Error", status: false });
            } else {
              return res
                .status(200)
                .json({ message: "Order Submitted....!!", status: true });
            }
          }
        );
      }
    }
  );
});

// Filter Action.......................................
router.get("/fetch_all_productLTH", function (req, res) {
  pool.query(
    "select P.*,(select C.categoryname from category C where C.categoryid=P.categoryid) as cn,(select S.subcategoryname from subcategory S where S.subcategoryid=P.subcategoryid) as sn from products P order by  P.price",
    function (error, result) {
      if (error) {
        console.log("Error:", error);
        return res.status(500).json({ data: "" });
      } else {
        return res.status(200).json({ data: result });
      }
    }
  );
});

router.get("/fetch_all_product", function (req, res) {
  pool.query(
    "select P.*,(select C.categoryname from category C where C.categoryid=P.categoryid) as cn,(select S.subcategoryname from subcategory S where S.subcategoryid=P.subcategoryid) as sn from products P order by  P.price desc",
    function (error, result) {
      if (error) {
        console.log("Error:", error);
        return res.status(500).json({ data: "" });
      } else {
        return res.status(200).json({ data: result });
      }
    }
  );
});

router.post("/fetch_all_size_by_size", function (req, res) {
  pool.query(
    "select * from products where productid in (select productid from color where size=?)",
    [req.body.size],
    function (error, result) {
      if (error) {
        console.log("Error:", error);
        return res.status(500).json({ data: "" });
      } else {
        return res.status(200).json({ data: result });
      }
    }
  );
});
//..............................................................

// Search Action.................................................
router.post("/search_product", function (req, res) {
  var q =
    "select P.*,(select C.categoryname from category C where C.categoryid=P.categoryid) as cn,(select S.subcategoryname from subcategory S where S.subcategoryid=P.subcategoryid) as sn from product P where P.productname like '%" +
    req.body.productname +
    "%' ";
  pool.query(q, function (error, result) {
    if (error) {
      console.log("Error:", error);
      return res.status(500).json({ data: "" });
    } else {
      return res.status(200).json({ data: result });
    }
  });
});
//..............................................................

module.exports = router;
