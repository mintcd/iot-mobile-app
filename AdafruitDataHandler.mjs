import mqtt from 'mqtt';

export default class AdafruitDataHandler {
    constructor(thingName, publishFeeds, subscribeFeeds, initialValue, frequency = 5000) {
        this.thingName = thingName;
        this.value = initialValue !== undefined ? initialValue : "0";
        this.receivedMessage = "";
        this.frequency = frequency === undefined ? 5000 : frequency

        this.username = process.env.USERNAME;
        this.password = process.env.PASSWORD;
        this.uri = `tcp://io.adafruit.com:1883`;

        this.client = null;
        this.publishFeeds = Array.isArray(publishFeeds) ? publishFeeds : [publishFeeds];
        this.subscribeFeeds = Array.isArray(subscribeFeeds) ? subscribeFeeds : [subscribeFeeds];

        this.dataPublisher = this.defaultDataPublisher;
        this.messageHandler = this.defaultMessageHandler;
    }

    connect() {
        const options = {
            username: this.username,
            password: this.password,
        };

        this.client = mqtt.connect(this.uri, options);

        this.client.on('connect', () => {
            console.log('Connected to Adafruit MQTT broker');

            this.subscribeFeeds.forEach(feed => {
                const subscribeTopic = `${this.username}/feeds/${feed}`;
                this.client.subscribe(subscribeTopic, (err) => {
                    if (err) {
                        console.error('Error subscribing to topics:', err);
                    } else {
                        console.log('Subscribed to Adafruit feed:', feed);
                    }
                });
            });

            setInterval(() => {
                this.publishFeeds.forEach(feed => {
                    if (this.dataPublisher) {
                        this.dataPublisher(feed);
                    }
                });
            }, 7000);
        });

        this.client.on('message', (topic, message) => {
            this.messageHandler(topic, message);
        });

        this.client.on('error', (error) => {
            console.error('Error:', error);
        });
    }

    setValue(value) {
        this.value = value
    }

    setDataPublisher(func) {
        this.dataPublisher = func;
    }

    setMessageHandler(func) {
        this.messageHandler = func;
    }

    defaultDataPublisher(feed, valueHandler = undefined) {
        const topic = `${this.username}/feeds/${feed}`;
        const publishValue = this.value.toString();
        this.client.publish(topic, publishValue, { qos: 1 }, (err) => {
            if (err) {
                console.error('Error publishing message:', err);
            } else {
                console.log(`Feed: ${feed}. Published: ${publishValue}`);
            }
        });
    }

    defaultMessageHandler(topic, message) {
        this.receivedMessage = message
        console.log(`Feed: ${topic}. Received: ${this.receivedMessage}`);
    }
}
