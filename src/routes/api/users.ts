import { Response } from 'express';
import { UserRequest, IUserId } from '../../types';

const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route  POST api/users
// @desc   Register user
// @access Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req: UserRequest<IUserId>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, name, email, password } = req.body;

    try {
      // See if user exists
      let userEmail = await User.findOne({ email });
      let userName = await User.findOne({ username });

      if (userEmail) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Email address is already registered' }] });
      }
      if (userName) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Username not available' }] });
      }
      // Get users gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg', //pg filter
        d: 'mm',
      });

      let user = new User({
        name,
        username,
        email,
        avatar,
        password,
      });
      // Encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 36000 }, //10 hours
        (err: any, token: string) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      //res.send("User successfully registered");
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
