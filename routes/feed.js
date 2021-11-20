const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const feedController = require("../controller/feed");

// GET /posts
router.get("/posts", feedController.getPosts);

// // POST /post
// router.post(
//   "/post",
//   [
//     body("title").trim().isLength({ min: 5 }),
//     body("content").trim().isLength({ min: 7 }),
//   ],
//   feedController.postCreatePost
// );

// GET /post/60ae6a9a7a74e9151446eedb
router.get("/post/:postId", feedController.getPost);

// // PUT /post/1
// router.put(
//   "/post/:postId",
//   [
//     body("title").trim().isLength({ min: 5 }),
//     body("content").trim().isLength({ min: 7 }),
//   ],
//   feedController.editPost
// );

// // DELETE /post.1
// router.delete("/post/:postId", feedController.deleteFile);

module.exports = router;
