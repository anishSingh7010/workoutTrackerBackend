import { Router } from 'express';
import {
  loginUser,
  registerUser,
  useRefreshToken,
  logoutUser,
  activateAccount,
} from '../controllers/users.controller.js';
import {
  validateNewUser,
  validateLoginUser,
} from '../middleware/validateNewUser.js';
import verifyJWT from '../middleware/verifyJWT.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

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
app.get('/workouts', verifyJWT, verifyAdmin, (req, res) => {
  // user will be available in the req if you use verifyJWT
  return res.status(200).json({ success: true });
});

/* route: '/refresh-token'
 * controller - useRefreshToken: Grants a new access token if the refresh token is valid
 */
app.post('/refresh-token', useRefreshToken);

/**
 *
 */
app.get('/verify/:userId/:uniqueString', activateAccount);

/* route: '/logout'
 * controller - logoutUser: Logs the user out and deletes their access token and refresh token
 */
app.post('/logout', logoutUser);

export default app;
