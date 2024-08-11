const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");

// Set up Express app
const app = express();

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect("mongodb://localhost/mydatabase", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a schema for storing audio file paths
const audioSchema = new mongoose.Schema({
  path: String,
});

const Audio = mongoose.model("Audio", audioSchema);

// Set up a route for handling file uploadss
app.post("/uploads", uploads.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No audio file uploadsed.");
  }

  const audioPath = req.file.path;

  // Save the audio file path to MongoDB
  const audio = new Audio({
    path: audioPath,
  });

  audio.save((err) => {
    if (err) {
      console.error("Error saving audio path to MongoDB:", err);
      return res.status(500).send("Error saving audio path.");
    }

    res.send("Audio file uploadsed and path saved to MongoDB.");
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
