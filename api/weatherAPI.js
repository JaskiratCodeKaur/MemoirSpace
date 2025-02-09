import axios from "axios";

export const fetchWeatherData = async (latitude, longitude) => {
  try {
    const apiKey = "E42UFP898KH8AX4PF3C9QTQDT"; // Replace with your Visual Crossing API key
    const response = await axios.get(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}`,
      {
        params: {
          key: apiKey,
          unitGroup: "metric", // Unit for temperature (e.g., Celsius)
          contentType: "json", // Desired response format
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching weather data:", error);
    throw error; // Throw error to be handled in Dashboard.js
  }
};
