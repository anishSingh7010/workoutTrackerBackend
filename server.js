import express from 'express';
import cors from 'cors';
import { config as dotenvConfig } from 'dotenv';
import authenticationRoutes from './src/routes/authentication.routes.js';
import connectDB from './src/config/db.js';

const app = express();
dotenvConfig();

var corsOptions = {
  origin: process.env.PORT,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use(authenticationRoutes);

// set port, listen for requests
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
