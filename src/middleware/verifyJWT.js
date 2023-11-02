import { verify } from '../util/jwtHelper.js';
import { logEvents } from './logger.js';

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // invalid token if it doesnt begin with Bearer
  if (!authHeader?.startsWith('Bearer')) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  const { isError, errorMsg, result } = await verify(
    token,
    process.env.ACCESS_TOKEN_SECRET
  );
  if (isError) {
    logEvents(req, errorMsg, 'debugLogs');
    return res.status(401).json({ msg: 'Unauthorized', error: errorMsg });
  }
  req.user = result.user;
  req.role = result.role;
  next();
};

export default verifyJWT;
