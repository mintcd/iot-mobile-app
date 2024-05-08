import Device from './utils/device.mjs';


const temperatureSensor = new Device(
  'TemperatureSensor',
  ["temperature"],
  [],
  "0",
)

temperatureSensor.setDataPublisher(
  function (feed, valueHandler = undefined) {
    const topic = `${this.username}/feeds/${feed}`;
    const publishValue = (Math.floor(Math.random() * 31) + 20).toString()
    temperatureSensor.client.publish(topic, publishValue, { qos: 1 }, (err) => {
      if (err) {
        console.error('Error publishing message:', err);
      } else {
        console.log(`Feed: ${feed}. Published: ${publishValue}`);
      }
    });
  })

temperatureSensor.work()

const humiditySensor = new Device(
  'HumiditySensor',
  ["humidity"],
  [],
  "0",
)

humiditySensor.setDataPublisher(
  function (feed, valueHandler = undefined) {
    const topic = `${this.username}/feeds/${feed}`;
    const publishValue = (Math.floor(Math.random() * 31) + 20).toString()
    temperatureSensor.client.publish(topic, publishValue, { qos: 1 }, (err) => {
      if (err) {
        console.error('Error publishing message:', err);
      } else {
        console.log(`Feed: ${feed}. Published: ${publishValue}`);
      }
    });
  })

humiditySensor.work()


const bulb = new Device(
  'bulb',
  ['bulb'],
  ["fancontroller"],
  "1",
)

bulb.setMessageHandler((topic, message) => {
  fan.setValue(parseInt(message))
  console.log(`Bulb has been turned: ${fan.value ? "ON" : "OFF"}.`)
})

bulb.work()

const airConditioner = new Device(
  'AirConditioner',
  ['airconditioner'],
  ["airconditionercontroller", "temperature"],
  "20",
)

airConditioner.setMessageHandler((topic, message) => {
  if (topic === 'process.env.USERNAME/feeds/temperature' && parseInt(message) > 35) {
    console.log(`Air conditioner has been turned ON at 20 °C`)
    airConditioner.setValue(20)
  } else {
    airConditioner.setValue(0)
  }
})

airConditioner.work()
