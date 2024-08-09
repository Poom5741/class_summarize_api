const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { mkdirp } = require("mkdirp");
const { rimraf } = require("rimraf");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });

const API_KEY = process.env.OPENAI_API;
const API_URL = "https://api.openai.com/v1/audio/transcriptions";
const CHUNK_DURATION = 60; // Duration of each chunk in seconds

// ... (add the splitAudio, transcribeChunk, and transcribeAudio functions here)

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const audioFilePath = req.file.path;
    const transcription = await transcribeAudio(audioFilePath);
    res.json({ transcription });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "An error occurred" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
