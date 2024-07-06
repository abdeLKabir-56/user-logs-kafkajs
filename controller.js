import KafkaConfig from "./config.js";

const logAccess = async (req, res) => {
  try {
    const { userId, cardID, doorId } = req.body;
    
    if (!userId || !cardID || !doorId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const now = new Date();
    const logEntry = {
      userId,
      cardId: cardID,
      doorId,
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString()
    };

    const kafkaConfig = new KafkaConfig();
    await kafkaConfig.produceAccessLog(logEntry);

    res.status(200).json(logEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const controllers = { logAccess };

export default controllers;
