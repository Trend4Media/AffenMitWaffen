import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dein-super-geheimer-jwt-secret-key-hier';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Kein Token vorhanden' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Ungültiger Token' });
    }
    req.user = user;
    next();
  });
};

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};
