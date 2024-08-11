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

// Add this line to parse JSON request bodies
app.use(express.json());

// Create the transcripts directory if it doesn't exist
const transcriptsDir = "./transcripts";
if (!fs.existsSync(transcriptsDir)) {
  fs.mkdirSync(transcriptsDir);
}

// Create the summaries directory if it doesn't exist
const summariesDir = "./summaries";
if (!fs.existsSync(summariesDir)) {
  fs.mkdirSync(summariesDir);
}

// ... (previous code remains unchanged)

// Step 2: Summarize transcript with AI
app.post("/summarize", async (req, res) => {
  const { filename } = req.body;
  const transcriptPath = `${transcriptsDir}/${filename}.json`;

  // Immediately respond with 200 status
  res.status(200).json({ message: "Summarization process started" });

  // Asynchronously process the summarization
  (async () => {
    try {
      const { transcript } = JSON.parse(fs.readFileSync(transcriptPath));

      const llm = new Ollama({
        model: "qwen2:1.5b",
      });

      const response = await llm.chat({
        messages: [
          {
            role: "system",
            content: `Core Guidelines
Analyze questions thoroughly before answering
Provide concise yet comprehensive answers
Break down complex questions into steps
Demonstrate expertise in Thai language usage
Summarize academic Thai texts objectively
Always respond in Thai, regardless of the question's language
Improvement Strategies
Question Analysis: Develop techniques to identify key components and implicit requirements in questions
Concise Answering: Practice balancing brevity and completeness in responses
Complex Problem Solving: Enhance ability to deconstruct and address multi-faceted questions
Language Proficiency: Continuously refine formal and academic Thai language skills
Objective Summarization: Improve techniques for extracting key information without personal bias
Language Adaptation: Strengthen capability to respond in Thai to questions in various languages
Cautions
Avoid inserting personal opinions, especially in academic summaries
Be vigilant about maintaining formal Thai language in all contexts
Ensure consistency in using Thai for responses, regardless of input language
Evaluation Criteria
Assess the accuracy and relevance of answers to questions
Evaluate the balance between conciseness and comprehensiveness
Check the effectiveness of breaking down complex questions
Analyze the quality and appropriateness of Thai language usage
Verify the objectivity in academic text summarization
Confirm consistent use of Thai in all responses
Reflection Points
What patterns emerge in effectively analyzed and answered questions?
Which types of questions or topics present the greatest challenges?
How can the balance between conciseness and comprehensiveness be optimized?
What strategies are most effective for maintaining objectivity in summaries?
Iterative Improvement
After each interaction, reflect on successful strategies and areas for improvement
Identify recurring challenges in question analysis or response formulation
Adjust approach based on these reflections for future interactions
Regularly update guidelines based on accumulated experience and feedback`,
          },
          {
            role: "user",
            content: `Core Guidelines
Analyze the given Thai text thoroughly
Create a concise summary in Thai, emphasizing key points
Identify main concepts from the text
Structure the response as: Summary, followed by Main Concepts
Respond only in Thai
Improvement Strategies
Key Point Selection: Utilize frequency and importance analysis techniques for words and phrases to identify key points more accurately
Summarization: Practice summarizing by starting with short paragraphs before progressing to longer articles
Main Concept Identification: Develop the ability to distinguish between main concepts and minor details
Language Translation: Practice translation with a focus on preserving the original meaning and tone
Cautions
Avoid word-for-word translation; focus on conveying overall meaning
Be cautious with specialized vocabulary or idioms that may be difficult to translate
Carefully verify the accuracy of both summary and translation
Evaluation Criteria
Assess the accuracy and completeness of content
Check the conciseness and clarity of the summary
Analyze the precision in identifying main concepts
Evaluate the quality of translation and Thai language usage
Reflection Points
What patterns emerge in successful summaries and translations?
Which types of content or structures are most challenging to summarize or translate?
How can the balance between brevity and comprehensiveness be optimized?
What strategies are most effective for preserving cultural nuances in translation?
Iterative Improvement
After each task, reflect on the challenges faced and successful strategies used
Identify areas for improvement in the summarization and translation process
Adjust the approach based on these reflections for future tasks
Regularly update the guidelines based on accumulated experience and feedback

Thai text to summarize: ${transcript}`,
          },
        ],
      });

      // Save summary in JSON format
      const summaryPath = `${summariesDir}/${filename}_summary.json`;
      fs.writeFileSync(
        summaryPath,
        JSON.stringify({ summary: response.message.content })
      );

      console.log(`Summary saved to ${summaryPath}`);
    } catch (error) {
      console.error("Error summarizing transcript:", error);
    }
  })();
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
