import React, {useMemo, useState} from "react";

import {api, cleanData, generateOptions, getFieldsByType, getFieldsLayout, pluginId, sanitizeEntity, sanitizeFormData, transformResponse} from '../../utils';
import PropTypes from "prop-types";
import {Duplicate, ExclamationMarkCircle} from "@strapi/icons";
import {getTrad} from "@strapi/plugin-i18n/admin/src/utils";
import styled from "styled-components";
import {useFetchClient, useNotification} from "@strapi/helper-plugin";
import {useIntl} from "react-intl";
import {useDispatch, useSelector} from "react-redux";
import {Dialog, DialogBody, DialogFooter, Select, Option, Button, Box, Typography, Flex} from '@strapi/design-system';
import uniq from "lodash/uniq";
import {useFormikContext} from 'formik';
import {stringify} from "qs";
import {useNotifyAT} from '@strapi/design-system';
import formLayout from "../../pages/EditView/form-layout";
import {get as _get} from 'lodash';
import pick from "lodash/pick";
import uniqueId from "lodash/uniqueId";
import get from "lodash/get";
import {useParams} from "react-router-dom";

const StyledTypography = styled(Typography)`
  svg {
    margin-right: ${({theme}) => theme.spaces[2]};
    fill: none;

    > g,
    path {
      fill: ${({theme}) => theme.colors.primary600};
    }
  }
`;

const CenteredTypography = styled(Typography)`
  text-align: center;
`;

const EditViewCopyLocale = (props) => {
  if (!props.localizations.length) {
    return null;
  }

  return <Content {...props} />;
};

const Content = ({appLocales, currentLocale, localizations, readPermissions}) => {
  const params = useParams();
  const id = _get(params, 'id', null);
  let {values, handleChange, setFieldValue, errors, setValues, initialValues, setFormikState} = useFormikContext();
  const options = generateOptions(appLocales, currentLocale, localizations, readPermissions);
  const toggleNotification = useNotification();
  const {notifyStatus} = useNotifyAT();
  const {formatMessage} = useIntl();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(options[0].value);
  const {get} = useFetchClient();

  // Get config and custom layouts.
  const {config, schema} = useSelector(state => state[`${pluginId}_config`]);
  const customLayouts = _get(config, 'layouts.menuItem', {});

  // Merge default fields layout with custom field layouts.
  const menuItemLayout = useMemo(() => {
    return getFieldsLayout(formLayout.menuItem, customLayouts, schema);
  }, [customLayouts]);
  const menuItemFields = Object.values(menuItemLayout).flat();

  const handleConfirmCopyLocale = async () => {
    if (!value) {
      handleToggle();
      return;
    }

    /**
     * Get menu data from other locale
     */
    const mediaFields = getFieldsByType(schema.menuItem, ['media']);
    const fetchParams = {
      populate: uniq([
        'localizations',
        'items',
        'items.parent',
        ...mediaFields.map(field => `items.${field}`),
      ]),
    };

    const queryString = stringify(fetchParams, {encode: false});
    setIsLoading(true);
    try {
      const {status, data: response} = await get(`/${pluginId}/${value}?${queryString}`);

      notifyStatus(
        formatMessage({
          id: getTrad('ui.loaded'),
          defaultMessage: 'Data has been loaded',
        })
      );

      /**
       * Transform response data
       * @type {*}
       */
      let data = transformResponse(response);

      const sanitizedBody = sanitizeEntity(data);
      const sanitizedMenuData = sanitizeFormData(sanitizedBody, data, formLayout.menu, true);
      const sanitizedMenuItemsData = _get(sanitizedBody, 'items', []).map(item => {
        const sanitizedItem = sanitizeEntity(item);
        sanitizedItem.publishedAt = new Date();
        const prevItem = _get(data, 'items', []).find(_item => _item.id === sanitizedItem.id);

        return sanitizeFormData(sanitizedItem, prevItem, menuItemFields, true);
      });

      let sanitizedData = {
        data: {
          ...sanitizedMenuData,
          items: sanitizedMenuItemsData,
        },
      };

      /**
       * sanitize menu data
       */
        ///////////////////////////////////////////////////////////
      const menuData = pick(sanitizedData.data, ['title', 'slug'], {});
      const menuItemIdMap = sanitizedData.data.items.map(item => ({
        id: item.id,
        createId: uniqueId('create'),
      }));

      const menuItemsData = sanitizedData.data.items.map(item => {
        const createMap = menuItemIdMap.find(_item => _item.id === item.id);
        const parentMap = menuItemIdMap.find(_item => _item.id === item.parent?.id);

        const createId = createMap ? createMap.createId : null;
        const parent = parentMap ? {id: parentMap.createId} : null;

        return {
          ...sanitizeEntity(item),
          id: createId,
          parent,
          publishedAt: new Date(),
        };
      });


      const clonedBody = {
        data: {
          ...menuData,
          items: menuItemsData,
          slug: `${menuData.slug}-${new Date().getTime()}`,
          publishedAt: new Date(),
          locale: currentLocale,
        },
      };

      /**
       * update menu with clone data
       */

      await api.putAction(id, clonedBody);

      const fetchParams = {
        locale: currentLocale,
        populate: uniq([
          'localizations',
          'items',
          'items.parent',
          ...mediaFields.map(field => `items.${field}`),
        ]),
      };
      const {status: _status, data: _data} = await api.get(id, fetchParams);

      /**
       * Update new data to formik
       * @type {*}
       */
      let new_data = transformResponse(_data);
      Object.keys(new_data).forEach(key => {
        setFieldValue(key, data[key]);
      });

      setValues(new_data);
    } catch (err) {
      console.error(err);

      toggleNotification({
        type: 'warning',
        message: {
          id: getTrad('edit.copy-locale-failure'),
          defaultMessage: 'Failed to copy locale',
        },
      });
    } finally {
      setIsLoading(false);
      handleToggle();
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <StyledTypography
        fontSize={2}
        textColor="primary600"
        as="button"
        type="button"
        onClick={handleToggle}
      >
        <Flex>
          <Duplicate width="12px" height="12px"/>
          {formatMessage({
            id: getTrad('CMEditViewCopyLocale.copy-text'),
            defaultMessage: 'Fill in from another locale',
          })}
        </Flex>
      </StyledTypography>
      {isOpen && (
        <Dialog onClose={handleToggle} title="Confirmation" isOpen={isOpen}>
          <DialogBody icon={<ExclamationMarkCircle/>}>
            <Flex direction="column" alignItems="stretch" gap={2}>
              <Flex justifyContent="center">
                <CenteredTypography id="confirm-description">
                  {formatMessage({
                    id: getTrad('CMEditViewCopyLocale.ModalConfirm.content'),
                    defaultMessage:
                      'Your current content will be erased and filled by the content of the selected locale:',
                  })}
                </CenteredTypography>
              </Flex>
              <Box>
                <Select
                  label={formatMessage({
                    id: getTrad('Settings.locales.modal.locales.label'),
                  })}
                  onChange={handleChange}
                  value={value}
                >
                  {options.map(({label, value}) => {
                    return (
                      <Option key={value} value={value}>
                        {label}
                      </Option>
                    );
                  })}
                </Select>
              </Box>
            </Flex>
          </DialogBody>
          <DialogFooter
            startAction={
              <Button onClick={handleToggle} variant="tertiary">
                {formatMessage({
                  id: 'popUpWarning.button.cancel',
                  defaultMessage: 'No, cancel',
                })}
              </Button>
            }
            endAction={
              <Button variant="success" onClick={handleConfirmCopyLocale} loading={isLoading}>
                {formatMessage({
                  id: getTrad('CMEditViewCopyLocale.submit-text'),
                  defaultMessage: 'Yes, fill in',
                })}
              </Button>
            }
          />
        </Dialog>
      )}
    </>
  );
}

EditViewCopyLocale.propTypes = {
  localizations: PropTypes.array.isRequired,
};

Content.propTypes = {
  appLocales: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string,
    })
  ).isRequired,
  currentLocale: PropTypes.string.isRequired,
  localizations: PropTypes.array.isRequired,
  readPermissions: PropTypes.array.isRequired,
};

export default EditViewCopyLocale;
