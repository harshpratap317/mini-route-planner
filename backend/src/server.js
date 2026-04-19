require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/db");

const port = process.env.PORT || 5000;

connectDatabase();

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});

