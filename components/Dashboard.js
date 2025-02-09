import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { fetchWeatherData } from "../api/weatherAPI";
import { getCurrentLocation } from "../utils/location";
import { DContexts } from "../contexts/DContexts";
import { ImageBackground } from 'react-native';

const Dashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quote, setQuote] = useState({ quote: "", author: "" });
  const [currentTime, setCurrentTime] = useState(""); 
  const { primarycolor, opacitycolor } = useContext(DContexts);

  // Background images based on time of day
  const backgroundImages = {
    day: require('../assets/weather/day.jpg'),
    night: require('../assets/weather/night.jpg'),
  };

  // Weather icons
  const weatherIcons = {
    'snow': require('../assets/weather/snowy.png'),
    'rain': require('../assets/weather/rain.png'),
    'fog': require('../assets/weather/fog.png'),
    'wind': require('../assets/weather/windy-day.png'),
    'cloudy': require('../assets/weather/cloudy_1.png'),
    'partly-cloudy-day': require('../assets/weather/cloudy-day.png'),
    'partly-cloudy-night': require('../assets/weather/cloudy-night.png'),
    'clear-day': require('../assets/weather/clear-day.webp'),
    'clear-night': require('../assets/weather/clear-night.png'),
    'snow-showers-day': require('../assets/weather/cloudDay.png'),
    'snow-showers-night': require('../assets/weather/cloudsnow.png'),
    'thunder-rain': require('../assets/weather/thunder.png'),
    'thunder-showers-day': require('../assets/weather/thunderShower.webp'),
    'thunder-showers-night': require('../assets/weather/thunderShower.webp'),
    'showers-day': require('../assets/weather/showerDay.png'),
    'showers-night': require('../assets/weather/showerDay.png'),
  };

  useEffect(() => {
    getCurrentLocation()
      .then(({ latitude, longitude }) => {
        fetchWeatherData(latitude, longitude)
          .then((data) => {
            setWeatherData(data.currentConditions);
            setLocationData(data.address);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching weather data:", error);
            setIsLoading(false);
          });
      })
      .catch((error) => {
        console.error("Error getting current location:", error);
        setIsLoading(false);
      });

    // Fetch random quote
    fetch("https://qapi.vercel.app/api/random")
      .then((response) => response.json())
      .then((data) => {
        setQuote({
          quote: data.quote,
          author: data.author,
        });
      })
      .catch((error) => {
        console.error("Error fetching quote:", error);
      });

    // Update time every second
    const intervalId = setInterval(() => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const getBackgroundImage = () => {
    const hours = new Date().getHours();
    return hours >= 6 && hours < 18 ? backgroundImages.day : backgroundImages.night;
  };

  const getLocationTime = () => {
    if (locationData && locationData.localtime) {
      const localTime = new Date(locationData.localtime);
      return localTime.toLocaleString();
    }
    return "N/A";
  };

  const getWeatherIcon = () => {
    if (weatherData && weatherData.conditions) {
      return weatherIcons[weatherData.conditions.toLowerCase()] || weatherIcons['clear-day'];
    }
    return weatherIcons['clear-day'];
  };

  // Greeting based on the time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 12) {
      return "Good Morning";
    } else if (hours >= 12 && hours < 18) {
      return "Good Afternoon";
    } else {
      return "Good Night";
    }
  };

  return (
    <ImageBackground source={getBackgroundImage()} style={styles.dashboard}>
      <View style={styles.dashboardContent}>
        <View style={styles.dashboardUp}>
          <Text style={styles.todayText}>{getGreeting()}</Text>
          {isLoading ? (
            <ShimmerPlaceholder style={styles.shimmerText} />
          ) : (
            <Text style={styles.locationTime}>
              {locationData && locationData.localtime ? getLocationTime() : currentTime}
            </Text>
          )}
        </View>

        {isLoading ? (
          <ShimmerPlaceholder style={styles.shimmerText} />
        ) : (
          <View style={styles.weatherContainer}>
            <Image source={getWeatherIcon()} style={styles.weatherIcon} />
            <Text style={styles.temperature}>
              {weatherData ? `${weatherData.temp}°C` : "N/A"}
            </Text>
          </View>
        )}

        {/* Quote Section */}
        {quote.quote && quote.author && !isLoading && (
          <View style={styles.quoteContainer}>
            <Text style={styles.dashboardQuote}>"{quote.quote}"</Text>
            <Text style={styles.authorText}>- {quote.author}</Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  dashboard: {
    padding: 10,
    margin: 15,
    marginTop: 10,
    borderRadius: 15,
    elevation: 10,
    height: 250, // Reduced height for a more compact dashboard
    overflow: 'hidden', // Ensure the rounded corners clip the content
  },
  dashboardContent: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15, // Ensure content has rounded corners
    paddingHorizontal: 15,
    flex: 1,
  },
  dashboardUp: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 5,
  },
  todayText: {
    color: "#f2f2f2",
    fontSize: 18, // Reduced font size for better fit
    fontWeight: "bold",
  },
  locationTime: {
    color: "#f2f2f2",
    fontSize: 12, // Reduced font size
  },
  temperature: {
    fontSize: 20, // Adjusted font size
    fontWeight: "bold",
    margin: 2,
    color: "#ffffff",
  },
  timeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 10,
  },
  dashboardQuote: {
    fontSize: 14, // Adjusted font size for quote
    fontStyle: "italic",
    color: "#f2f2f2",
    textAlign: "center",
    marginVertical: 4,
  },
  authorText: {
    fontSize: 12, // Adjusted font size for author
    color: "#f2f2f2",
    textAlign: "center",
    marginTop: 5,
    fontWeight: "bold",
  },
  shimmerText: {
    width: 100,
    height: 20,
    margin: 5,
  },
  weatherContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  weatherIcon: {
    width: 60, // Reduced icon size
    height: 60, // Reduced icon size
    marginBottom: 10,
  },
});

export default Dashboard;
