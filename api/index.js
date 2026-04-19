const express = require('express');
const app = require('../backend/src/app');

const serverlessApp = express();
serverlessApp.use('/api', app);

module.exports = serverlessApp;
