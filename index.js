const { join } = require('path');

module.exports = {
  serverScript: join(__dirname, 'server/server.js'),
  cwd: join(__dirname),
};
