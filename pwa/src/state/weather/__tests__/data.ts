export const mockWeatherData = {
  current: {
    temperature_2m: 14.5,
    weather_code: 1,
    windspeed_10m: 10,
    apparent_temperature: 15,
  },
  hourly: {
    time: [new Date().toISOString()],
    temperature_2m: [14.5],
    precipitation_probability: [0],
    weather_code: [1]
  }
};
