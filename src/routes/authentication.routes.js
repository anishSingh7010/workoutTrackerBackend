import { Router } from 'express';
import { registerUser } from '../controllers/users.controller.js';
import { body } from 'express-validator';
import { validateUser } from '../middleware/validateUser.js';

const app = Router();

/* route: '/register'
 * middleware - validateUser: Includes validation for name, email and password
 * controller - registerUser: Adds user to the database if no errors found
 */
app.post('/register', validateUser, registerUser);

export default app;
