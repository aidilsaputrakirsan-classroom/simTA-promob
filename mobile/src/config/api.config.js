const ENV = {
  dev: {
    apiUrl: 'http://10.128.150.166:3000/api', // Local WiFi
  },
  prod: {
    apiUrl: 'https://sim-ta-promob.vercel.app/api', // Vercel production
  }
};

const getEnvVars = () => {
  // Force prod untuk testing
  // return ENV.dev;  // Uncomment ini kalau mau pakai localhost
  return ENV.prod;    // Selalu pakai prod URL
};

export default getEnvVars();