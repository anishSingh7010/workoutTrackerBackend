import { Router } from 'express';
import { register } from '../controllers/users.controller.js';

const app = Router();

// test route
app.post('/register', register);

export default app;
