import AdafruitDataHandler from './AdafruitDataHandler.mjs';


const temperatureSensor = new AdafruitDataHandler(
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

temperatureSensor.connect()


const fan = new AdafruitDataHandler(
  'Fan',
  ['bulb'],
  ["fancontroller"],
  "1",
)

fan.setMessageHandler((topic, message) => {
  fan.setValue(parseInt(message))
  console.log(`Bulb has been turned: ${fan.value ? "ON" : "OFF"}.`)
})

fan.connect()

const airConditioner = new AdafruitDataHandler(
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

airConditioner.connect()
