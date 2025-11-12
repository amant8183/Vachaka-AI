import connectDB from "./db";
import dotenv from "dotenv";
import app from "./app";

dotenv.config({
    path: "./.env",
});

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Example app listening on port http://localhost:${PORT}`);
        })
    })
    .catch((err) => {
        console.log("MongoDB connection error", err);
        process.exit(1);
    });