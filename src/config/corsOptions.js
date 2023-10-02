import allowedOrigins from './allowedOrigins.js';

const corsOptions = {
  origin: (origin, callback) => {
    // !origin allows postman or other no origin clients access the api
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by cors'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
