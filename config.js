import { Kafka } from "kafkajs";

class KafkaConfig {
  constructor() {
    this.kafka = new Kafka({
      clientId: "access-control-app",
      brokers: ["localhost:9092"], // Update this if needed
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: "access-control-group" });
  }

  async produceAccessLog(logEntry) {
    try {
      await this.producer.connect();
      await this.producer.send({
        topic: "access-logs",
        messages: [{ value: JSON.stringify(logEntry) }],
      });
    } catch (error) {
      console.error(error);
    } finally {
      await this.producer.disconnect();
    }
  }

  async consume(topic, callback) {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: topic, fromBeginning: true });
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const value = message.value.toString();
          callback(value);
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
}

export default KafkaConfig;
