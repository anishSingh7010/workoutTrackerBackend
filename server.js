import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config as dotenvConfig } from 'dotenv';
import authenticationRoutes from './src/routes/authentication.routes.js';
import connectDB from './src/config/db.js';
import corsOptions from './src/config/corsOptions.js';

const app = express();
dotenvConfig();

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

connectDB();

app.use(authenticationRoutes);

// set port, listen for requests
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
