const verifyAdmin = (req, res, next) => {
  if (req.role !== 'Admin') {
    return res.status(403).json({
      status: 'FAILED',
      msg: 'You are not authorized to access this resource',
    });
  }
  next();
};

export { verifyAdmin };
