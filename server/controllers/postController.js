import asyncHandler from 'express-async-handler';
import Post from '../models/Post.js';

export const getPosts = asyncHandler(async(req, res) => {
    const posts = await Post.find({status: 'published'})
    .populate('user', 'name avatar')
    .sort({publishedAt: -1});

    res.status(200).json({success: true, count: posts.length, data: posts});
});

export const getMyPosts = asyncHandler(async(req, res) => {
    const posts = await Post.find({user: req.user.id})
    .sort({createdAt: -1});

    res.status(200).json({success: true, count: posts.length, data: posts});
});

export const getPost = asyncHandler(async(req, res) => {
    const post = await Post.findOne({slug: req.params.slug})
    .populate('user', 'name avatar');

    if(!post){
        res.status(404);
        throw new Error('Post not found.');
    }

    if (post.status === 'draft' && (!req.user || post.user.toString() !== req.user.id)) {
        res.status(403);
        throw new Error('Not authorized to view this draft');
    }

    res.status(200).json({ success: true, data: post });
})

export const createPost = asyncHandler(async(req, res) => {
    req.body.user = req.user.id;

    const post = await Post.create(req.body);

    res.status(201).json({success: true, data: post});
});

export const updatePost = asyncHandler(async(req, res) => {
    let post = await Post.findById(req.params.id);

    if(!post){
        res.status(404);
        throw new Error('Post not found');
    }

    if (post.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to update this post');
    }

    post.set(req.body);
    post = await post.save();

    res.status(200).json({ success: true, data: post });
});

export const deletePost = asyncHandler(async(req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    if (post.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this post');
    }

    await post.deleteOne();

    res.status(200).json({ success: true, data: {} });
})