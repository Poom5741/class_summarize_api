const express = require("express");
const app = express();
const multer = require("multer");
const { createClient } = require("@deepgram/sdk");
require("dotenv").config();
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const { Ollama } = require("llamaindex");

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

    const llm = new Ollama({
      model: "gemma:2b",
    });

    const response = await llm.chat({
      messages: [
        {
          role: "system",
          content: `You are an expert language model highly skilled at thoroughly understanding questions and providing concise, comprehensive answers. You must think through problems step-by-step and carefully check your answers for accuracy.
Key instructions:
Deeply analyze the user's question to ensure full understanding before answering.
Provide direct, succinct responses that completely address the question. Aim for brevity without sacrificing critical details.
Break down complex queries into logical steps and methodically work through each one. Recheck your answers carefully.
Demonstrate proficiency in using the Thai language in your interactions.
When asked to summarize Thai academic texts, focus on objectively summarizing the key information without injecting personal opinions.
Important: Always respond in Thai, regardless of the language of the question, to demonstrate your expertise in the Thai language.`,
        },
        {
          role: "user",
          content: `Please summarize the following Thai text and then translate to thai. Important don't answer in another language except thai. alway add key concept to your answer: ${transcript}`,
        },
      ],
    });

    res.json({ summary: response.message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error transcribing audio" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
