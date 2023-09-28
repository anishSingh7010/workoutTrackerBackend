import jwt from 'jsonwebtoken';

const getAccessToken = (email) => {
  return jwt.sign(
    {
      email: email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '10m' }
  );
};

const getRefreshToken = (email) => {
  return jwt.sign(
    {
      email: email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );
};

export { getAccessToken, getRefreshToken };
