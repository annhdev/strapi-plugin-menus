import Bullet from "@strapi/plugin-i18n/admin/src/components/CMEditViewInjectedComponents/CMEditViewLocalePicker/Bullet";
import React, {memo, useMemo} from "react";
import {Box, Divider, Select, Option, Typography, Flex, Grid, GridItem} from '@strapi/design-system';
import {api, getTrad, pluginId} from "../../utils";
import {stringify} from "qs";
import PropTypes from "prop-types";
import EditViewCopyLocale from "../EditViewCopyLocale";
import {createLocalesOption} from "@strapi/plugin-i18n/admin/src/components/CMEditViewInjectedComponents/CMEditViewLocalePicker/utils";
import get from "lodash/get";
import {useHistory, useParams} from "react-router-dom";
import {useNotification, useQueryParams} from "@strapi/helper-plugin";

const EditViewSelectLocale = ({appLocales, currentLocale, localizations, readPermissions, createPermissions, currentLocaleStatus}) => {

  const params = useParams();
  const [{query}, setQuery] = useQueryParams();
  const {push} = useHistory();
  const toggleNotification = useNotification();

  const id = get(params, 'id', null);
  const currentEntityId = id;
  const hasDraftAndPublishEnabled = true;
  const defaultLocale = appLocales.find((loc) => loc.isDefault);
  const _currentLocale = appLocales.find((loc) => loc.code === currentLocale);

  const options = createLocalesOption(appLocales, localizations).filter(({status, value}) => {
    if (status === 'did-not-create-locale') {
      return createPermissions.find(({properties}) =>
        get(properties, 'locales', []).includes(value)
      );
    }

    return readPermissions.find(({properties}) => get(properties, 'locales', []).includes(value));
  });
  const filteredOptions = options.filter(({value}) => value !== currentLocale);

  async function handleLocaleChange(value) {
    if (value === currentLocale) {
      return;
    }

    const nextLocale = options.find((option) => {
      return option.value === value;
    });

    const {status, id: _id} = nextLocale;

    const defaultQuery = !query ? {plugins: {i18n: {locale: currentLocale}}} : query;

    // const defaultQuery = useMemo(() => {
    //   if (!query) {
    //     return {plugins: {i18n: {locale: currentLocale}}};
    //   }
    //
    //   return query;
    // }, [query, currentLocale]);


    let defaultParams = {
      plugins: {
        ...defaultQuery.plugins,
        i18n: {...defaultQuery.plugins.i18n, locale: value},
      },
    };


    if (currentEntityId) {
      defaultParams.plugins.i18n.relatedEntityId = currentEntityId;
    }

    if (status === 'did-not-create-locale') {
      const newLocaleBody = {
        title: 'new Menu',
        slug: `new-menu-${new Date().getTime()}`,
        locale: value,
        publishedAt: new Date(),
        items: [],
      };

      try {
        let res = await api.postLocaleAction(id, newLocaleBody);
        if (res.status === 200) {
          let data = res.data;
          return push({
            pathname: `/plugins/${pluginId}/edit/${data.id}`,
            search: stringify(defaultParams, {encode: false}),
          });
        }
      } catch (e) {
        console.error(e);
        toggleNotification({
          type: 'warning',
          message: {
            id: getTrad('edit.create-localizations-failure'),
            defaultMessage: 'Create localizations failed',
          },
        });
        return;
      }
    }

    push({
      pathname: `/plugins/${pluginId}/edit/${_id}`,
      search: stringify(defaultParams, {encode: false}),
    });

  }

  return (
    <>
      <Select
        label={'Select locales'}
        onChange={handleLocaleChange}
        value={_currentLocale.code}
      >
        <Option
          value={_currentLocale.code}
          disabled
          startIcon={hasDraftAndPublishEnabled ? <Bullet status={currentLocaleStatus}/> : null}
        >
          {_currentLocale.name}
        </Option>
        {filteredOptions.map((option) => {
          return (
            <Option
              key={option.value}
              value={option.value}
              startIcon={hasDraftAndPublishEnabled ? <Bullet status={option.status}/> : null}
            >
              {option.label}
            </Option>
          );
        })}
      </Select>
    </>
  );
}

EditViewSelectLocale.propTypes = {
  appLocales: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string,
    })
  ).isRequired,
  currentLocale: PropTypes.string.isRequired,
  localizations: PropTypes.array.isRequired,
  readPermissions: PropTypes.array.isRequired,
  createPermissions: PropTypes.array.isRequired,
  currentLocaleStatus: PropTypes.string.isRequired,
};

export default EditViewSelectLocale;
