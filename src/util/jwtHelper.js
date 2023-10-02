import jwt from 'jsonwebtoken';

const generateAccessToken = (email) => {
  return jwt.sign(
    {
      email: email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '10m' }
  );
};

const generateRefreshToken = (email) => {
  return jwt.sign(
    {
      email: email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );
};

const verify = async (token, secretKey) => {
  let isError = false;
  let result;
  let errorMsg = '';
  try {
    result = await jwt.verify(token, secretKey);
  } catch (err) {
    // catching errors while validating
    isError = true;
    errorMsg = err.message;
  }
  return { isError, errorMsg, result };
};

export { generateAccessToken, generateRefreshToken, verify };
