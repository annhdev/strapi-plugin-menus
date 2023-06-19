'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/config',
    handler: 'plugin::menus.menu.config',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {actions: ['plugin::menus.read']},
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/',
    handler: 'plugin::menus.menu.find',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'GET',
    path: '/:id',
    handler: 'plugin::menus.menu.findOne',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {actions: ['plugin::menus.read']},
        },
      ],
    },
  },
  {
    method: 'POST',
    path: '/',
    handler: 'plugin::menus.menu.create',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {actions: ['plugin::menus.create']},
        },
      ],
    },
  },
  {
    method: 'POST',
    path: '/:id/localizations',
    handler: 'plugin::menus.menu.createLocalization',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {actions: ['plugin::menus.localization']},
        },
      ],
    },
  },
  {
    method: 'PUT',
    path: '/:id',
    handler: 'plugin::menus.menu.update',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {actions: ['plugin::menus.update']},
        },
      ],
    },
  },
  {
    method: 'DELETE',
    path: '/:id',
    handler: 'plugin::menus.menu.delete',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {actions: ['plugin::menus.delete']},
        },
      ],
    },
  },
];
