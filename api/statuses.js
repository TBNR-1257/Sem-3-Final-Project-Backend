const express = require("express");
const router = express.Router();
const Status = require("../models/Status");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

// Get all Statuses
router.get("/", auth, async (req, res) => {
  try {
    let statuses = await Status.find({ user: req.user._id });
    return res.json(statuses);
  } catch (e) {
    return res.json({ e, msg: "Cannot get records" });
  }
});

// Get Status By ID
router.get("/:id", auth, async (req, res) => {
  try {
    let statuses = await Status.findById(req.params.id);
    return res.json(statuses);
  } catch (e) {
    return res.json({ e, msg: "Cannot get record" });
  }
});

// Add a status
router.post("/:id", auth, async (req, res) => {
  try {
    let status = new Status();
    status.assignment = req.params.id;
    status.user = req.user._id;
    status.save();
    return res.json({ status, msg: "Assignment Completed" });
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

// Update status of assignment
// router.put("/:id", auth, async (req, res) => {
//   try {
//     if (
//       !req.user.role === "admin" ||
//       !req.user.role === "teacher" ||
//       !req.user.role === "student"
//     )
//       return res.status(401).json({ msg: "You are unauthorized" });

//     let userFound = await User.findById(req.params.id);

//     let currentAssignment = await Assignment.findById(req.params.id);

//     // let status = await Status.findByIdAndUpdate(req.params.id, {
//     //     ...req.body,
//     //     state:
//     // })

//     return res.json({ msg: "Assignment has been updated" });
//   } catch (e) {
//     return res.json({ e, msg: "Cannot update this assignment" });
//   }
// });

// if (!mongoose.Types.ObjectId.isValid(req.params.id))
//   return res.status(400).json({ msg: "No product found" });

// if (!req.user.role === "student")
//   return res
//     .status(401)
//     .json({ msg: "You are not authorized to update this assignment" });

// let currentAssignment = await Assignment.findById(req.params.id);

module.exports = router;
