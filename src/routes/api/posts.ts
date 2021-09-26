import { Request, Response } from 'express';
import {
  BodyRequest,
  UserRequest,
  ParamsRequest,
  IUserId,
  IPost,
} from '../../types';

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Post = require('../../models/Post');
const { check, validationResult } = require('express-validator');

// @route  POST api/posts
// @desc   Create a post
// @access Private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req: UserRequest<IUserId> & BodyRequest<IPost>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        username: user.username,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  GET api/posts
// @desc   Get posts
// @access Private
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const posts = await Post.find().sort({ date: -1 });

    res.json(posts);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  GET api/posts/:id
// @desc   Get post by id
// @access Private
router.get('/:id', auth, async (req: ParamsRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.json(post);
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route  DELETE api/posts/:id
// @desc   Delete post
// @access Private
router.delete(
  '/:id',
  auth,
  async (req: UserRequest<IUserId> & ParamsRequest, res: Response) => {
    try {
      const post = await Post.findById(req.params.id);
      //check post
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }

      // Check user
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
      await post.remove();

      res.json({ msg: 'Post removed' });
    } catch (err: any) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Post not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route  PUT api/posts/like/:id
// @desc   Like a post
// @access Private
router.put(
  '/like/:id',
  auth,
  async (req: UserRequest<IUserId> & ParamsRequest, res: Response) => {
    try {
      const post = await Post.findById(req.params.id);
      //check if post has already been liked by this user
      if (
        post.likes.filter((like: any) => like.user.toString() === req.user.id)
          .length > 0
      ) {
        return res.status(400).json({ msg: 'Post already liked' });
      }

      post.likes.unshift({ user: req.user.id });
      await post.save();
      res.json(post.likes);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  PUT api/posts/like/:id
// @desc   Unlike a post
// @access Private
router.put(
  '/unlike/:id',
  auth,
  async (req: UserRequest<IUserId> & ParamsRequest, res: Response) => {
    try {
      const post = await Post.findById(req.params.id);
      //check if post has not already been liked by this user
      if (
        post.likes.filter((like: any) => like.user.toString() === req.user.id)
          .length === 0
      ) {
        return res.status(400).json({ msg: 'Post has not yet been liked' });
      }
      // Get and remove index
      const removeIndex = post.likes.map((like: any) =>
        like.user.toString().indexOf(req.user.id)
      );
      post.likes.splice(removeIndex, 1);

      await post.save();
      res.json(post.likes);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  PUT api/posts/comment/:id
// @desc   Add comment to a post
// @access Private
router.put(
  '/comment/:id',
  auth,
  async (
    req: UserRequest<IUserId> & BodyRequest<IPost> & ParamsRequest,
    res: Response
  ) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        username: user.username,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);
      post.save();
      res.json(post.comments);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  DELETE api/posts/comment/:id/:comment_id
// @desc   Delete comment
// @access Private
router.delete(
  '/comment/:id/:comment_id',
  auth,
  async (req: UserRequest<IUserId> & ParamsRequest, res: Response) => {
    try {
      const post = await Post.findById(req.params.id);

      //pull out comment
      const comment = post.comments.find(
        (comment: any) => comment.id === req.params.comment_id
      );
      // check if comment exists
      if (!comment) {
        return res.status(404).json({ msg: 'Comment not found' });
      }
      //check user
      if (comment.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      // Get and remove index
      const removeIndex = post.comments.map((comment: any) =>
        comment.user.toString().indexOf(req.user.id)
      );
      post.comments.splice(removeIndex, 1);

      post.save();
      res.json(post.comments);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
