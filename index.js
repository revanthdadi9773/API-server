const express = require("express");
const cors = require("cors");
const app = express();
const cors = require("cors");
app.use(cors({ origin: "*" })); // Allow all origins

app.get("/", (req, res) => {
    res.send("Hello from API! with changes");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});


