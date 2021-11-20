const { validationResult } = require("express-validator");

const fs = require("fs");
const path = require("path");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({ posts: posts });
    })
    .catch((err) => console.log(err));
};

exports.postCreatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed. Please check your data",
      errors: errors.array(),
    });
  }

  if (!req.file) {
    const error = new Error("No image recieved");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path.replace("\\", "/");
  const creator = { name: "Yaseen" };
  const post = new Post({
    title: title,
    content: content,
    creator: creator,
    imageUrl: imageUrl,
  });

  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post was created successfully",
        post: result,
      });
    })
    .catch((err) => console.log(err));
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Post fetched.", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.editPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed. Please check your data",
      errors: errors.array(),
    });
  }
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }

  if (!imageUrl) {
    const error = new Error("No image recieved");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Couldn't find the post.");
        error.statusCode = 422;
        throw error;
      }
      if (imageUrl != post.imageUrl) {
        clearFile(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
      return res.status(200).json({
        message: "Post edited successfully",
        post: result,
      });
    })
    .catch((err) => console.log(err));
};

exports.deleteFile = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Couldn't find the post.");
        error.statusCode = 422;
        throw error;
      }

      //Check wheather user has permission to delete the file
      clearFile(post.imageUrl);
      return Post.findByIdAndRemove(post._id);
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({ meassage: "Post deleted successfully" });
    })
    .catch((err) => console.log(err));
};

const clearFile = (filePath) => {
  filePath = path.join(__dirname, "../", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
