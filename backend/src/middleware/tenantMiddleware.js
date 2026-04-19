module.exports = (req, res, next) => {
  if (!req.user || !req.user.organization_id) {
    return res.status(403).json({ error: 'Tenant context missing.' });
  }
  
  req.organizationId = req.user.organization_id;
  next();
};
