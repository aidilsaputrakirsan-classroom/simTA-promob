const ENV = {
  dev: {
    apiUrl: 'http://10.128.150.166:3000/api', // IP Anda
  },
  prod: {
    apiUrl: 'https://your-backend.vercel.app/api',
  }
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export default getEnvVars();