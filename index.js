import express from "express";
import bodyParser from "body-parser";
import controllers from "./controller.js";
import KafkaConfig from "./config.js";
import fs from 'fs/promises';
import path from 'path';

const app = express();
const jsonParser = bodyParser.json();

const LOG_FILE = path.join(process.cwd(), 'access_logs.json');

// Middleware to parse JSON bodies
app.use(express.json());

// Route for logging access
app.post("/api/access", controllers.logAccess);

// Kafka consumer setup
const kafkaConfig = new KafkaConfig();
kafkaConfig.consume("access-logs", async (value) => {
  console.log("📨 Received access log: ", value);
  
  // Parse the received message
  const logEntry = JSON.parse(value);

  try {
    // Read existing logs
    let logs = [];
    try {
      const data = await fs.readFile(LOG_FILE, 'utf8');
      logs = JSON.parse(data);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    // Add new log entry
    logs.push(logEntry);

    // Write updated logs back to file
    await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2));

    console.log("✅ Log entry saved to file");
  } catch (error) {
    console.error("❌ Error saving log entry to file:", error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
