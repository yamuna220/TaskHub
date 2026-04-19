const app = require('../backend/src/app');
const initDb = require('../backend/src/config/initDb');

// Initialize database on lambda cold start
initDb();

const serverlessApp = express();
serverlessApp.use('/api', app);

module.exports = serverlessApp;
