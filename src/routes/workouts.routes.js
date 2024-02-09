import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import { addWorkout, getWorkouts } from '../controllers/workouts.controller.js';
import { validateWorkout } from '../middleware/validateWorkout.js';

const app = Router();

/* route: '/account/workouts'
 * middleware - verifyJWT: checks if the user is logged in and has a valid auth token
 * controller - addExercise: Gets the current user's workouts
 */
app.get('/workouts', verifyJWT, getWorkouts);

/* route: '/account/add-workout'
 * middleware - verifyJWT: checks if the user is logged in and has a valid auth token
 * controller - addWorkout: adds the workout into the user model object
 */
app.post('/workouts', verifyJWT, validateWorkout, addWorkout);

export default app;
