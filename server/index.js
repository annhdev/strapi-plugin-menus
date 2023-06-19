'use strict';

const config = require('./config');
const contentTypes = require('./content-types');
const controllers = require('./controllers');
const routes = require('./routes');
const services = require('./services');
const bootstrap = require('./bootstrap');

module.exports = {
  bootstrap,
  // bootstrap() {},
  config,
  routes,
  contentTypes,
  controllers,
  // destroy() {},
  // middlewares,
  // policies,
  // register() {},

  services,
};
