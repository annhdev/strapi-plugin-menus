'use strict';
const coreApi = require('./server/services/core-api');

module.exports = (plugin) => {

  plugin.services['core-api'] = coreApi

  return plugin;
}
