const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
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

// Get all Assignment
router.get("/", async (req, res) => {
  try {
    let assignments = await Assignment.find();
    return res.json(assignments);
  } catch (e) {
    return res.json({ e, msg: "Cannot get assignments" });
  }
});

// Get Assignment By ID
router.get("/:id", async (req, res) => {
  try {
    let assignments = await Assignment.findById(req.params.id);
    return res.json(assignments);
  } catch (e) {
    return res.json({ e, msg: "Cannot get assignment" });
  }
});

// Add Assignment
router.post("/", auth, upload.single("image"), (req, res) => {
  try {
    if (req.user.role === "admin" || req.user.role === "teacher") {
      let assignment = new Assignment(req.body);
      assignment.user = req.user._id;

      if (req.file) {
        assignment.image = "public/" + req.file.filename;
      }
      assignment.save();
      return res.json({ assignment, msg: "Sucessfully added assignment" });
    } else {
      return res
        .status(401)
        .json({ msg: "You are not authorized to add an assignment" });
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

    if (!req.user.role === "admin" || !req.user.role === "teacher")
      return res
        .status(401)
        .json({ msg: "You are not authorized to update this assignment" });

    let currentAssignment = await Assignment.findById(req.params.id);

    let assignment = await Assignment.findByIdAndUpdate(req.params.id, {
      ...req.body,
      image: req.file ? "public/" + req.file.filename : currentAssignment.image,
    });

    return res.json({ msg: "Assignment has been updated" });
  } catch (e) {
    return res.json({ e, msg: "Cannot update this assignment" });
  }
});

// Delete Assignment by ID
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.json({ msg: "No assignment found" });

    if (req.user.role === "admin" || req.user.role === "teacher") {
      const assignment = await Assignment.findById(req.params.id);
      const filename = assignment.image;
      const filepath = path.join(__dirname, "../" + filename);
      fs.unlinkSync(filepath);
      await Assignment.findByIdAndDelete(assignment._id);
      return res.json({ assignment, msg: "Successfully deleted !" });
    } else {
      return res
        .status(401)
        .json({ msg: "You are not authorized to delete assignment" });
    }
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

module.exports = router;
