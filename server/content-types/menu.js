'use strict';

module.exports = {
  kind: 'collectionType',
  collectionName: 'menus',
  info: {
    displayName: 'Menu',
    singularName: 'menu',
    pluralName: 'menus',
    tableName: 'menus',
  },
  options: {
    draftAndPublish: true,
  },
  pluginOptions: {
    'content-manager': {
      visible: true,
    },
    'content-type-builder': {
      visible: true,
    },
    "i18n": {
      "localized": true
    }
  },
  attributes: {
    title: {
      type: 'string',
      required: true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    slug: {
      type: 'uid',
      targetField: 'title',
      required: true,
    },
    items: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'plugin::menus.menu-item',
      mappedBy: 'root_menu',
    }
  },
};
