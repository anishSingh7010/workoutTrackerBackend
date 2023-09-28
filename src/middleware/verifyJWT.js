import jwt from 'jsonwebtoken';

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // invalid token if it doesnt begin with Bearer
  if (!authHeader?.startsWith('Bearer')) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  console.log(token);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ msg: 'Forbidden request' });
    req.user = user;
    next();
  });
};

export default verifyJWT;
