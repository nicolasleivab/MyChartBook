import { Request, Response } from 'express';

const express = require("express");
const connectDB = require("./config/db");

const app = express();

// connect db
connectDB();

// init middleware
app.use(express.json({ extended: false }));

app.get("/", (req: Request, res: Response) => res.send("API running..."));

// Define routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

const PORT: string | number = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
