'use strict';

module.exports = async ({strapi}) => {
  const actions = [
    {
      section: 'plugins',
      displayName: 'Read',
      uid: 'read',
      pluginName: 'menus',
    },
    {
      section: 'plugins',
      displayName: 'Create',
      uid: 'create',
      pluginName: 'menus',
    },
    {
      section: 'plugins',
      displayName: 'Update',
      uid: 'update',
      pluginName: 'menus',
    },
    {
      section: 'plugins',
      displayName: 'Delete',
      uid: 'delete',
      pluginName: 'menus',
    },
    {
      section: 'plugins',
      displayName: 'Create Localization',
      uid: 'localization',
      pluginName: 'menus',
    }
  ];

  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
