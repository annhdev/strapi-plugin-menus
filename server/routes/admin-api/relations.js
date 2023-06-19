'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/relations/:model/:targetField',
    handler: 'plugin::menus.relations.findAvailable',
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
    path: '/relations/:model/:id/:targetField',
    handler: 'plugin::menus.relations.findExisting',
    config: {
      policies: [
        {
          name: 'admin::hasPermissions',
          config: {actions: ['plugin::menus.read']},
        },
      ],
    },
  },
];
