import { connect } from "mqtt"

const serverUri = "tcp://io.adafruit.com:1883"

const options = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD
}

const client = connect(serverUri, options);

console.log("Client created")

client.on("connect", () => {
  console.log("Connected successfully!");
  client.subscribe("process.env.USERNAME/feeds/sensor1", (err) => {
    if (!err) {
      client.publish("process.env.USERNAME/feeds/sensor1", "45");

    } else {
      console.log(err)
    }
  });
});

client.on("error", () => {
  console.log("Published message to sensor1");
}
)

client.on("message", (topic, message) => {
  console.log(message.toString());
  client.end();
});
