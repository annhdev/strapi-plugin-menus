<div align="center">
  <img style="width: 160px; height: auto;" src="public/logo-2x.png" alt="Logo for Strapi menus plugin" />
  <h1>Strapi Menus</h1>
  <p>A plugin for Strapi CMS to customize the structure of menus and menu items.</p>
  <img style="width: 960px; height: auto;" src="public/Screenshot 2023-06-19 181211.png" alt="Screenshot for Strapi menus plugin" />
</div>

## Get Started

* [Features](#features)
* [Installation](#installation)
* [Configuration](#configuration)
* [Roadmap](#roadmap)

## <a id="features"></a>✨ Features
* All features in [lastest project](https://github.com/mattmilburn/strapi-plugin-menus#features)
* Localization support for menu and menu item

<img style="width: 960px; height: auto;" src="public/Screenshot 2023-06-19 182443.png" alt="Screenshot for Strapi menus plugin" />

  - fill content from other language:
    <img style="width: 960px; height: auto;" src="public/Screenshot 2023-06-20 142830.png" alt="Screenshot for Strapi menus plugin" />
  - delete locale of menu:
    

* RBAC support
  - admin:
  <img style="width: 960px; height: auto;" src="public/Screenshot 2023-06-19 182703.png" alt="Screenshot for Strapi menus plugin" />
      
  - public:
  <img style="width: 960px; height: auto;" src="public/Screenshot 2023-06-19 182756.png" alt="Screenshot for Strapi menus plugin" />


## <a id="installation"></a>✨ Installation

### Step 1:

  * clone project from __[gitHub](https://github.com/annhdev/strapi-plugin-menus)__ to [root folder]/src/plugins

```agsl
git clone https://github.com/annhdev/strapi-plugin-menus.git ./src/plugins
```

  * install dependencies for plugins

```agsl
cd ./src/plugins/strapi-plugin-menus
```
```agsl
yarn install
```
or
```agsl
npm run install
```


  * Overide strapi __i18n__ plugin to fix Localization Handler for plugin.

  `move directory 'i18n' to [root folder]/src/extensions`

  * rebuild strapi admin
```agsl
yarn build
```
or
```agsl
npm run build
```

  

## <a id="credits"></a>❤️ Credits :
<div style="display: flex;flex-direction: row; align-items: center; justify-items: center">
<img style="width:36px;height:36px;border-radius:50%;margin-right: 10px;" src="https://avatars.githubusercontent.com/u/7082646?v=4">
<a href="https://github.com/mattmilburn/strapi-plugin-menus">Mattmilburn</a>
</div>

## <a id="roadmap"></a>🚧 Roadmap
* Drag and drop items
* Populate `url` via relation
* Restore deleted items (before saving)
* More translations
