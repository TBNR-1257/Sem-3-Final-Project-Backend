// MICORSERVICES ARCHITECTURE
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 5127;
require("dotenv").config();
const cors = require("cors");
const axios = require("axios");
const { DB_HOST, DB_NAME, DB_PORT } = process.env;

// Local Connection
// mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// Online Connection
mongoose.connect(
  "mongodb://mongo:xwJ3FCQ4smQqeTLtDjZ6@containers-us-west-75.railway.app:6837"
);

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

//this is chatengine.io
app.post("/authenticate", async (req, res) => {
  const { username } = req.body;
  // Get or create user on Chat Engine!
  try {
    const r = await axios.put(
      "https://api.chatengine.io/users/",
      { username: username, secret: username, first_name: username },
      { headers: { "Private-Key": process.env.CHAT_ENGINE_PRIVATE_KEY } }
      //chat_engine_private_key
    );
    return res.status(r.status).json(r.data);
  } catch (e) {
    return res.status(e.response.status).json(e.response.data);
  }
});

app.use("/users", require("./api/users"));
app.use("/posts", require("./api/posts"));
app.use("/assignments", require("./api/assignments"));
app.use("/statuses", require("./api/statuses"));

app.listen(PORT, () => console.log("Server is running on PORT: " + PORT));

mongoose.connection.once("open", () => console.log("Connected to MongoDB"));
