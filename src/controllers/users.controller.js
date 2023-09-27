const register = (req, res) => {
  console.log(req.body.name);
  res.json({ success: true });
};

export { register };
