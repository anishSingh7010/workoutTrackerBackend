import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/users.controller.js';
import {
  validateNewUser,
  validateLoginUser,
} from '../middleware/validateNewUser.js';
import verifyJWT from '../middleware/verifyJWT.js';

const app = Router();

/* route: '/register'
 * middleware - validateUser: Includes validation for name, email and password
 * controller - registerUser: Adds user to the database if no errors found
 */
app.post('/register', validateNewUser, registerUser);

/* route: '/login'
 * controller - loginUser: Checks if the user is in the database and signs them in if they enter the correct password
 */
app.post('/login', validateLoginUser, loginUser);

// test route for jwt
app.get('/workouts', verifyJWT, (req, res) => {
  // user will be available in the req if you use verifyJWT
});

export default app;
