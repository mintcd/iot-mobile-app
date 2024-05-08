import createClient from "./createClient.mjs";
import global from "../global-variables.mjs"

export default class Device {
    constructor(deviceName,
        publishFeeds,
        subscribeFeeds,
        initialValue,
        protocol,
        frequency) {
        this.deviceName = deviceName;
        this.value = initialValue !== undefined ? initialValue : "0";
        this.receivedMessage = "";
        this.frequency = frequency === undefined ? 7000 : frequency

        this.protocol

        this.client = createClient(this.protocol);
        this.publishFeeds = Array.isArray(publishFeeds) ? publishFeeds : [publishFeeds];
        this.subscribeFeeds = Array.isArray(subscribeFeeds) ? subscribeFeeds : [subscribeFeeds];

        this.dataPublisher = this.defaultDataPublisher;
        this.messageHandler = this.defaultMessageHandler;
    }

    work() {
        this.client.on('connect', () => {

            console.log(`${this.deviceName} connected successfully as ${global.username}.`);

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
            }, this.frequency);
        });

        this.client.on('message', (topic, message) => {
            this.messageHandler(topic, message);
        });

        this.client.on("error", () => {
            console.log("Error connection.");
        })

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
