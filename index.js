const { join } = require('path');

module.exports = {
  serverScript: join(__dirname, 'scripts/ant/server.js'),
  cwd: join(__dirname),
};
