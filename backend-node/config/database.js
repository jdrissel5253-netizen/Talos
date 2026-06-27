const logger = require('../services/logger');

logger.info('Using PostgreSQL database');
module.exports = require('./database-pg');
