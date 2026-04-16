import "dotenv/config";
import app from "./app.js";
import connectDB from "../src/database/index.js";
const PORT = process.env.PORT || 3000;
// connect DB first
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server running");
    console.log(`http://localhost:${PORT}`);
  })
}).catch();

