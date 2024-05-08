import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { FaTemperatureEmpty, FaTemperatureHalf, FaTemperatureFull } from "react-icons/fa6";
import { TbAirConditioningDisabled, TbAirConditioning } from "react-icons/tb";
import { FaLightbulb } from "react-icons/fa";

import createClient from './utils/createClient.mjs';
import global from './global-variables.mjs';

import mqtt from 'mqtt';

export default function App() {
  const [fanValue, setFanValue] = useState(true);
  const [tempValue, setTempValue] = useState('0');
  const [airValue, setAirValue] = useState(20)

  let temperatureIcon;
  let temperatureColor;
  if (tempValue == 0 || tempValue >= 20 && tempValue < 30) {
    temperatureIcon = <FaTemperatureEmpty />;
    temperatureColor = 'blue';
  } else if (tempValue >= 30 && tempValue < 40) {
    temperatureIcon = <FaTemperatureHalf />;
    temperatureColor = 'orange';
  } else if (tempValue >= 40 && tempValue <= 50) {
    temperatureIcon = <FaTemperatureFull />;
    temperatureColor = 'red';
  } else {
    temperatureIcon = null; // Or default icon
    temperatureColor = 'black'; // Or default color
  }

  useEffect(() => {
    const username = global.username;
    const password = global.password;

    const options = {
      username: username,
      password: password,
    };

    const uri = global.ws_uri;
    const subscribeFeeds = ['fan', 'temperature'];
    const client = mqtt.connect(uri, options);

    client.on('connect', () => {
      console.log('Connected to Adafruit MQTT broker');

      subscribeFeeds.forEach(feed => {
        const subscribeTopic = `${username}/feeds/${feed}`;
        client.subscribe(subscribeTopic, (err) => {
          if (err) {
            console.error('Error subscribing to topics:', err);
          } else {
            console.log('Subscribed to Adafruit feed:', feed);
          }
        });
      });
    });

    client.on('message', (topic, message) => {
      console.log(`Feed: ${topic}. Received: ${message}`)
      if (topic === `${process.env.USERNAME}/feeds/temperature`)
        setTempValue(parseInt(message));
      // if (topic === "process.env.USERNAME/feeds/fan")
      //   setFanValue(() => toBool(message));
    });

  }, []);

  const username = global.username;
  const password = global.password;

  const options = {
    username: username,
    password: password,
  };

  const uri = global.ws_uri;
  const client = mqtt.connect(uri, options);

  function fanButtonHandler() {
    const action = fanValue ? "0" : "1"
    console.log(fanValue, action)
    client.publish(`${process.env.USERNAME}/feeds/fancontroller`, action, { qos: 1 }, (err) => {
      if (err) {
        console.error('Error publishing message:', err);
      } else {
        console.log(`Action completed!`);
        setFanValue(prevValue => !prevValue)
      }
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome Home!</Text>
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={[{
            fontSize: 100,
            color: fanValue ? "yellow" : "gray"
          }]}>
            <FaLightbulb />
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={fanButtonHandler}>
          <Text style={styles.buttonText}>
            {fanValue ? "Turn off" : "Turn on"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[{
          fontSize: 100,
          color: temperatureColor
        }]}>
          {temperatureIcon}
        </Text>
        <Text style={styles.infoValue}>
          {tempValue} °C
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[{
          fontSize: 100,
          color: 'green'
        }]}>
          {tempValue > 30 ?
            <TbAirConditioning />
            : <TbAirConditioningDisabled />}
        </Text>
        <Text style={styles.infoValue}>
          {airValue} °C
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  infoLabel: {
    fontSize: 18,
    marginRight: 10,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  onText: {
    color: 'blue',
  },
  offText: {
    color: 'gray',
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
