import express from 'express';
import {protect} from '../middleware/authMiddleware.js'
import { createPost, deletePost, getMyPosts, getPost, getPosts, updatePost } from '../controllers/postController.js';


const postRouter = express.Router();

postRouter.get('/', getPosts);
postRouter.get('/:slug', getPost);

postRouter.route('/me').get(protect, getMyPosts);

postRouter.route('/').post(protect, createPost);

postRouter.route('/:id').put(protect, updatePost).delete(protect, deletePost);

export default postRouter;