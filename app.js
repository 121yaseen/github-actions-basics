const express = require("express");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");

// For Working with MongoDB
const mongoose = require("mongoose");

// For handling formdata
// Here for uploading images
const multer = require("multer");

const feedRoutes = require("./routes/feed");

const app = express();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimeType === "image/png" ||
    file.mimeType === "image/jpg" ||
    file.mimeType === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json());
app.use(multer({ storage: fileStorage, filter: fileFilter }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"),
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE"
    ),
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    ),
    next();
});
// for using secure headers
// kinda unnecessary for this small application, but anyway
app.use(helmet());
app.use("", feedRoutes);
// Logging
// Also kinda unnecessary, but wanted to try logging
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("common", { stream: accessLogStream }));

const connectionString =
  `mongodb+srv://${process.env.MONGO_USERNAME}:` +
  `${process.env.MONGO_PASSWORD}@cluster0.tfkjg.mongodb.net/` +
  `${process.env.MONGO_DBNAME}?retryWrites=true&w=majority`;

mongoose
  .connect(connectionString)
  .then((result) => {
    console.log("Connected to DB");
    app.listen(process.env.PORT || 8080);
  })
  .catch((err) => console.log(err));
