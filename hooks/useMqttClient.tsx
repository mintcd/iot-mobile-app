import { useState, useEffect } from "react";
import { connect } from "mqtt";

const useMqttClient = () => {
  const [client, setClient] = useState(null);

  useEffect(() => {
    const serverUri = "tcp://io.adafruit.com:1883";
    const options = {
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    };

    const mqttClient = connect(serverUri, options);
    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, []);

  return client;
};

export default useMqttClient;
