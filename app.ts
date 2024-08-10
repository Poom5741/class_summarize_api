const express = require("express");
const app = express();
const multer = require("multer");
const { createClient } = require("@deepgram/sdk");
require("dotenv").config();
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const upload = multer({ dest: "./uploads/" });

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const { file } = req;
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      fs.readFileSync(file.path),
      {
        model: "nova-2",
        smart_format: true,
        language: "th",
      }
    );

    if (error) throw error;

    const paragraphs =
      result.results.channels[0].alternatives[0].paragraphs.paragraphs;
    const transcript = paragraphs
      .map((paragraph) => {
        return paragraph.sentences.map((sentence) => sentence.text).join(" ");
      })
      .join("\n\n");

    const prompt = `This is Thai language. Please rewrite the text and then summarize it: ${transcript}`;
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "gemma:2b",
      prompt: prompt,
    });

    res.json({ transcript, rewrittenText: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error transcribing audio" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
