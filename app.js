var express = require("express");
var cors = require("cors");
var createError = require("http-errors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var categoryRouter = require("./routes/category");
var subcategoryRouter = require("./routes/subcategory");
var productRouter = require("./routes/product");
var sizeRouter = require("./routes/size");
var colorRouter = require("./routes/color");
var adminRouter = require("./routes/admin");
var userinterfaceRouter = require("./routes/userinterface");
var bannerRouter = require("./routes/banner");

var app = express();

// View Engine Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Enable CORS
app.use(cors());

// Define Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/category", categoryRouter);
app.use("/subcategory", subcategoryRouter);
app.use("/product", productRouter);
app.use("/size", sizeRouter);
app.use("/color", colorRouter);
app.use("/admin", adminRouter);
app.use("/userinterface", userinterfaceRouter);
app.use("/banner", bannerRouter);
app.use("/images", express.static(path.join(__dirname, "public/images"))); // ✅ Serves static images

// Error Handling
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
