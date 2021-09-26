import { Request, Response } from 'express';
import {
  UserRequest,
  BodyRequest,
  ParamsRequest,
  IUserId,
  IProfileFields,
  IEducation,
  IExperience,
} from '../../types';

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

// @route  GET api/profile/me
// @desc   Get current user's profile
// @access Private
router.get('/me', auth, async (req: UserRequest<IUserId>, res: Response) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['username', 'avatar']);

    if (!profile) {
      return res
        .status(400)
        .json({ msg: 'There is currently no profile for this user' });
    }
    //send profile if exists
    res.json(profile);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  POST api/profile
// @desc   Create or update user profile
// @access Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (
    req: UserRequest<IUserId> & BodyRequest<IProfileFields>,
    res: Response
  ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      experience,
      education,
      social,
    } = req.body;

    //build profile object
    const profileFields = <IProfileFields>{};

    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (skills) profileFields.skills = skills;
    //propertyFields.skills = skills.split(',)
    if (bio) profileFields.bio = bio;
    if (experience) profileFields.experience = experience;
    if (education) profileFields.education = education;
    if (social) profileFields.social = social;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }
      //Create profile
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  GET api/profile
// @desc   Get all profiles
// @access Public

router.get('/', async (req: Request, res: Response) => {
  try {
    const profiles = await Profile.find().populate('user', [
      'username',
      'avatar',
    ]);
    res.json(profiles);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  GET api/profile/user/:user_id
// @desc   Get user's profile by id
// @access Public
router.get('/user/:user_id', async (req: ParamsRequest, res: Response) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id, //get user id from url params
    }).populate('user', ['username', 'avatar']);
    if (!profile) {
      return res.status(400).json('Profile not found');
    }
    res.json(profile);
  } catch (err: any) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json('Profile not found'); // for not valid objectids
    }
    res.status(500).send('Server Error');
  }
});

// @route  DELETE api/profile
// @desc   Delete profile, user and posts
// @access Private
router.delete('/', auth, async (req: UserRequest<IUserId>, res: Response) => {
  try {
    // @todo - remove user's posts
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'User removed' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  PUT api/profile/experience
// @desc   Add profile experience
// @access Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async (
    req: UserRequest<IUserId> & BodyRequest<IExperience>,
    res: Response
  ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } =
      req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  DELETE api/profile/experience/:exp_id
// @desc   Delete experience from profile
// @access Private
router.delete(
  '/experience/:exp_id',
  auth,
  async (req: UserRequest<IUserId> & ParamsRequest, res: Response) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // Get remove index
      const removeIndex = profile.experience
        .map((e: any) => e.id)
        .indexOf(req.params.exp_id);

      profile.experience.splice(removeIndex, 1);

      await profile.save();

      res.json(profile);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  PUT api/profile/education
// @desc   Add profile education
// @access Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
    ],
  ],
  async (
    req: UserRequest<IUserId> & BodyRequest<IEducation>,
    res: Response
  ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldOfStudy, year } = req.body;

    const newEdu = {
      school,
      degree,
      fieldOfStudy,
      year,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  DELETE api/profile/education/:exp_id
// @desc   Delete education from profile
// @access Private
router.delete(
  '/education/:edu_id',
  auth,
  async (req: UserRequest<IUserId> & ParamsRequest, res: Response) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // Get remove index
      const removeIndex = profile.education
        .map((e: any) => e.id)
        .indexOf(req.params.edu_id);

      profile.education.splice(removeIndex, 1);

      await profile.save();

      res.json(profile);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
