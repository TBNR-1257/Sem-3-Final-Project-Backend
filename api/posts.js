const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Get all Posts
router.get("/", async (req, res) => {
  try {
    let posts = await Post.find();
    return res.json(posts);
  } catch (e) {
    return res.json({ e, msg: "Cannot get assignments" });
  }
});

// Get Post By ID
router.get("/:id", async (req, res) => {
  try {
    let posts = await Post.findById(req.params.id);
    return res.json(posts);
  } catch (e) {
    return res.json({ e, msg: "Cannot get post" });
  }
});

// Add Post
router.post("/", auth, upload.single("image"), (req, res) => {
  try {
    if (req.user.role === "admin") {
      let post = new Post(req.body);
      post.user = req.user._id;

      if (req.file) {
        post.image = "public/" + req.file.filename;
      }
      post.save();
      return res.json({ post, msg: "Sucessfully added post" });
    } else {
      return res
        .status(401)
        .json({ msg: "You are not authorized to add a post" });
    }
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

// Update Assignment by ID
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ msg: "No product found" });

    if (!req.user.role === "admin")
      return res
        .status(401)
        .json({ msg: "You are not authorized to update this post" });

    let currentPost = await Post.findById(req.params.id);

    let post = await Post.findByIdAndUpdate(req.params.id, {
      ...req.body,
      image: req.file ? "public/" + req.file.filename : currentPost.image,
    });

    return res.json({ msg: "Post has been updated" });
  } catch (e) {
    return res.json({ e, msg: "Cannot update this post" });
  }
});

// Delete Post
router.delete("/:id", auth, async (req, res) => {
  try {
    let currentPost = await Post.findById(req.params.id);

    if (!currentPost) return res.json({ msg: "No post found" });

    if (currentPost.user != req.user._id)
      return res.status(401).json({ msg: "Unauthorized" });

    let post = await Post.findByIdAndDelete(req.params.id);
    return res.json({ msg: "Post deleted sucessfully", post });
  } catch (e) {
    return res.json({ e, msg: "Failed to delete post" });
  }
});

// Delete Post by ID
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.json({ msg: "No post found" });

    if (req.user.role === "admin") {
      const post = await Post.findById(req.params.id);
      const filename = post.image;
      const filepath = path.join(__dirname, "../" + filename);
      fs.unlinkSync(filepath);
      await Post.findByIdAndDelete(post._id);
      return res.json({ post, msg: "Successfully deleted !" });
    } else {
      return res
        .status(401)
        .json({ msg: "You are not authorized to delete post" });
    }
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

module.exports = router;
