const pluginPermissions = {
  // This permission regards the main component (App) and is used to tell
  // If the plugin link should be displayed in the menu
  // And also if the plugin is accessible. This use case is found when a user types the url of the
  // plugin directly in the browser
  main: [
    {action: 'plugin::menus.read', subject: null},
  ],
  createandupdate: [
    {action: 'plugin::menus.create', subject: null},
    {action: 'plugin::menus.update', subject: null},
  ],
  read: [
    {action: 'plugin::menus.read', subject: null},
  ],
  create: [
    {action: 'plugin::menus.create', subject: null},
  ],
  update: [
    {action: 'plugin::menus.update', subject: null},
  ],
  delete: [
    {action: 'plugin::menus.delete', subject: null},
  ],
  localization: [
    {action: 'plugin::menus.localization', subject: null},
  ]
};

export default pluginPermissions;
