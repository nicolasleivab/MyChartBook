import { Response, NextFunction } from 'express';
import { UserRequest, IUserId } from '../types';

const config = require('config');
const jwt = require('jsonwebtoken');

module.exports = function (
  req: UserRequest<IUserId>,
  res: Response,
  next: NextFunction
) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.user = decoded.user;
    next();
  } catch (err: any) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
