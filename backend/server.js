const app = require('./src/app');
const initDb = require('./src/config/initDb');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Initialize Database
initDb();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
