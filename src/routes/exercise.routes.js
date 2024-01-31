import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import {
  addExercise,
  deleteExercise,
  getExercises,
} from '../controllers/exercises.controller.js';
import { validateExercise } from '../middleware/validateExercise.js';

const app = Router();

/* route: '/account/add-exercise'
 * middleware - verifyJWT: checks if the user is logged in and has a valid auth token
 * controller - addExercise: Adds the exercise to the user schema
 */
app.post('/add-exercise', verifyJWT, validateExercise, addExercise);

/* route: '/account/exercises'
 * middleware - verifyJWT: checks if the user is logged in and has a valid auth token
 * controller - getExercises: Gets the current user's exercises
 */
app.get('/exercises', verifyJWT, getExercises);

/* route: '/account/delete-exercise'
 * middleware - verifyJWT: checks if the user is logged in and has a valid auth token
 * controller - deleteExercise: Deletes exercise based on the mongo object id passed
 */
app.delete('/delete-exercise', verifyJWT, deleteExercise);

export default app;
