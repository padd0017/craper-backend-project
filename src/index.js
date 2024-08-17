require("dotenv/config");
require("./utils/db");
const express = require("express");
require("./utils/passport");
const cors = require('cors');
const authCrap = require("./routers/authCrap.js");
const crapRouter = require("./routers/crapRouter");
const sanitizeCrap = require("./middlewares/sanitizedBody.js");
const sanitizeMongo = require('express-mongo-sanitize');
const { errorHandler } = require("./utils/error.js");

const app = express();
app.use(express.urlencoded({ extended: true }));


app.use(express.json());
app.use(sanitizeMongo());
app.use(sanitizeCrap);

app.use("/api/crap", crapRouter);
app.use("/auth", authCrap);

app.get("/", (_req, res) => {
    res.send("Server running ⛳️⛳️⛳️");
});

app.get('https://final-project-rho-blond.vercel.app/', (req, res) => {
    res.send(`Your token is ${req.query.token}`);
}); 

app.get("*", (_req, res) => {
    res.status(404).json({
    error: {
        message: "404 | Not found",
    },
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
