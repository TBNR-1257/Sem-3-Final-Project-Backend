const mongoose = require("mongoose");

const StatusSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
  },
  state: {
    type: Boolean,
    default: true,
  },
});

// false if there is something else to do before finish

module.exports = mongoose.model("Status", StatusSchema);
