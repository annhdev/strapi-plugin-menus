import React, {memo, useMemo} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import get from 'lodash/get';
import pick from 'lodash/pick';
import uniq from 'lodash/uniq';
import uniqueId from 'lodash/uniqueId';
import {Formik} from 'formik';
import {Form, useNotification, useOverlayBlocker, CheckPagePermissions, CheckPermissions, useRBACProvider, useQueryParams, useCustomFields, useLibrary, useAPIErrorHandler} from '@strapi/helper-plugin';
import {useNotifyAT} from '@strapi/design-system';
import {Button} from '@strapi/design-system/Button';
import {Link} from '@strapi/design-system/Link';
import {Stack} from '@strapi/design-system/Stack';
import {ContentLayout, HeaderLayout} from '@strapi/design-system/Layout';
import ArrowLeft from '@strapi/icons/ArrowLeft';
import Check from '@strapi/icons/Check';
import {Box, Divider, Select, Option, Typography, Flex, Grid, GridItem} from '@strapi/design-system';

import {FormLayout, Layout, MenuDataProvider, MenuItemsManager, Section,} from '../../components';
import {DragLayer} from '../../coreComponents';
import {api, getFieldsByType, getFieldsLayout, getTrad, pluginId, sanitizeEntity, sanitizeFormData, transformResponse,} from '../../utils';

import formLayout from './form-layout';
import formSchema from './form-schema';
import pluginPermissions from "../../permissions";
import checkPermissions from "../../utils/checkPermissions";
import selectI18NLocales from "@strapi/plugin-i18n/admin/src/selectors/selectI18nLocales";
import {useHistory, useParams} from "react-router-dom";
import Bullet from "@strapi/plugin-i18n/admin/src/components/CMEditViewInjectedComponents/CMEditViewLocalePicker/Bullet";
import {createLocalesOption} from "@strapi/plugin-i18n/admin/src/components/CMEditViewInjectedComponents/CMEditViewLocalePicker/utils";
import has from "lodash/has";
import {stringify} from "qs";
import EditViewCopyLocale from "../../components/EditViewCopyLocale";
import useContentTypePermissions from "@strapi/plugin-i18n/admin/src/hooks/useContentTypePermissions";
import EditViewSelectLocale from "../../components/EditViewSelectLocale";
import EditViewDeleteLink from "../../components/EditViewDeleteLink";

const CLONE_QUERY_KEY = 'menus-clone-{id}';
const CREATE_QUERY_KEY = 'menus-create';
const EDIT_QUERY_KEY = 'menus-edit-{id}';

const defaultValues = {title: '', slug: '', items: [],};

const EditView = ({history, location, match}) => {
  //const {id} = match.params;
  const {formatMessage} = useIntl();
  const {notifyStatus} = useNotifyAT();
  const toggleNotification = useNotification();
  const {lockApp, unlockApp} = useOverlayBlocker();
  const queryClient = useQueryClient();
  const {push} = useHistory();

  const {formatAPIError} = useAPIErrorHandler(getTrad);

  const {createPermissions, readPermissions} = useContentTypePermissions(`plugin::menus.menu`);

  const customFields = useCustomFields();
  const {fields: strapiFields} = useLibrary();

  const locales = useSelector(selectI18NLocales);
  const params = useParams();
  const [{query}, setQuery] = useQueryParams();

  const id = get(params, 'id', null);
  const currentEntityId = id;

  const defaultLocale = locales.find((loc) => loc.isDefault);
  const currentLocale = get(query, 'plugins.i18n.locale', defaultLocale.code);
  const _currentLocale = locales.find((loc) => loc.code === currentLocale);
  const hasDraftAndPublishEnabled = true


  const defaultQuery = useMemo(() => {
    if (!query) {
      return {plugins: {i18n: {locale: currentLocale}}};
    }

    return query;
  }, [query, currentLocale]);

  const {allPermissions: permissions} = useRBACProvider();

  useMemo(async () => {
    let _pemsCheck = checkPermissions(permissions, [pluginPermissions.createandupdate]);
    let _hasPerms = await Promise.all([..._pemsCheck])
    let disabled = _hasPerms.every(pem => pem === false);

    formLayout.menu = formLayout.menu.map(_menu => {

      if (_menu.input.name === 'locale') {
        _menu.input = {
          ..._menu.input,
          disabled: true
        }
      } else {
        _menu.input = {
          ..._menu.input,
          disabled: disabled
        }
      }

      return _menu;
    });
    formLayout.menuItem = formLayout.menuItem.map(_menuItem => {
      _menuItem.input = {
        ..._menuItem.input,
        disabled: disabled
      }
      return _menuItem;
    });
  }, [permissions]);

  // Get config and custom layouts.
  const {config, schema} = useSelector(state => state[`${pluginId}_config`]);
  const customLayouts = get(config, 'layouts.menuItem', {});

  // Merge default fields layout with custom field layouts.
  const menuItemLayout = useMemo(() => {
    return getFieldsLayout(formLayout.menuItem, customLayouts, schema);
  }, [customLayouts]);
  const menuItemFields = Object.values(menuItemLayout).flat();

  const isCreating = !id;
  const isCloning = location.pathname.split('/').includes('clone');

  let headerTitle = formatMessage({
    id: getTrad('edit.header.title'),
    defaultMessage: 'Edit menu',
  });

  let queryKey = EDIT_QUERY_KEY.replace('{id}', id);

  // Set props based on `isCreating` or `isCloning`.
  if (isCreating) {
    headerTitle = formatMessage({
      id: getTrad('create.header.title'),
      defaultMessage: 'Create menu',
    });

    queryKey = CREATE_QUERY_KEY;
  }

  if (isCloning) {
    headerTitle = formatMessage({
      id: getTrad('clone.header.title'),
      defaultMessage: 'Clone menu',
    });

    queryKey = CLONE_QUERY_KEY.replace('{id}', id);
  }

  const mediaFields = getFieldsByType(schema.menuItem, ['media']);
  const fetchParams = {
    locale: currentLocale,
    populate: uniq([
      'localizations',
      'items',
      'items.parent',
      ...mediaFields.map(field => `items.${field}`),
    ]),
  };

  const {status, data} = useQuery(queryKey, () => api.get(id, fetchParams), {
    enabled: !isCreating,
    select: data => transformResponse(data),
    onSuccess: () => {
      notifyStatus(
        formatMessage({
          id: getTrad('ui.loaded'),
          defaultMessage: 'Data has been loaded',
        })
      );
    },
    onError: () => {
      toggleNotification({
        type: 'warning',
        message: {
          id: getTrad('ui.error'),
          defaultMessage: 'An error occured',
        },
      });
    },
  });

  const localizations = get(data, 'localizations', []);
  let currentLocaleStatus = 'did-not-create-locale';
  // if current locale is published, set status to published
  if (has(data, 'publishedAt')) {
    currentLocaleStatus = data.publishedAt ? 'published' : 'draft';
  }


  const submitMutation = useMutation(body => {
    body.data.locale = currentLocale;
    // Maybe clone this menu with sanitized data.
    if (isCloning) {
      const menuData = pick(body.data, ['title', 'slug'], {});
      const menuItemIdMap = body.data.items.map(item => ({
        id: item.id,
        createId: uniqueId('create'),
      }));

      const menuItemsData = body.data.items.map(item => {
        const createMap = menuItemIdMap.find(_item => _item.id === item.id);
        const parentMap = menuItemIdMap.find(_item => _item.id === item.parent?.id);

        const createId = createMap ? createMap.createId : null;
        const parent = parentMap ? {id: parentMap.createId} : null;

        return {
          ...sanitizeEntity(item),
          id: createId,
          parent,
        };
      });

      const clonedBody = {
        data: {
          ...menuData,
          items: menuItemsData,
          locale: currentLocale,
        },
      };

      return api.postAction(clonedBody);
    }

    // Maybe submit a new menu.
    if (isCreating) {
      return api.postAction(body);
    }

    // If not creating or cloning, update this menu.
    return api.putAction(id, body);
  }, {
    refetchActive: true,
    onSuccess: async () => {
      await queryClient.invalidateQueries(queryKey);

      toggleNotification({
        type: 'success',
        message: {
          id: getTrad('ui.saved'),
          defaultMessage: 'Saved',
        },
      });
    },
    onError: () => {
      toggleNotification({
        type: 'warning',
        message: {
          id: getTrad('ui.error'),
          defaultMessage: 'An error occured',
        },
      });
    },
    onSettled: () => {
      unlockApp();
    },
  });

  const onSubmit = async (body, {setErrors}) => {
    lockApp();
    try {
      const sanitizedBody = sanitizeEntity(body);
      const sanitizedMenuData = sanitizeFormData(sanitizedBody, data, formLayout.menu, isCloning);
      const sanitizedMenuItemsData = get(sanitizedBody, 'items', []).map(item => {
        const sanitizedItem = sanitizeEntity(item);
        sanitizedItem.publishedAt = new Date();
        const prevItem = get(data, 'items', []).find(_item => _item.id === sanitizedItem.id);

        return sanitizeFormData(sanitizedItem, prevItem, menuItemFields, isCloning);
      });

      const res = await submitMutation.mutateAsync({
        data: {
          ...sanitizedMenuData,
          items: sanitizedMenuItemsData,
        },
      });

      // If we just cloned a page, we need to redirect to the new edit page.
      if ((isCreating || isCloning) && res?.data?.data?.id) {
        history.push(`/plugins/${pluginId}/edit/${res.data.data.id}`);
      }
    } catch (err) {
      unlockApp();

      const errorDetails = err?.response?.data?.error?.details;

      // Maybe set error details.
      if (errorDetails) {
        setErrors(errorDetails);
      } else {
        console.error(err);
      }
    }
  };

  async function onDeleteMenu(id) {
    try {
      await api.deleteAction(id);
      history.push(`/plugins/${pluginId}`);
    } catch (e) {
      toggleNotification({
        type: 'warning',
        message: formatAPIError(e),
      });
    }
  }

  return (
    <CheckPagePermissions permissions={pluginPermissions.read}>
      <Layout
        isLoading={!isCreating && status !== 'success'}
        title={headerTitle}
      >
        <DragLayer/>
        <Formik
          onSubmit={onSubmit}
          initialValues={data ?? defaultValues}
          validateOnChange={false}
          validationSchema={formSchema}
          enableReinitialize={true}
        >
          {({handleSubmit}) => {
            return (
              <Form onSubmit={handleSubmit}>
                <MenuDataProvider
                  isCreatingEntry={isCreating}
                  isCloningEntry={isCloning}
                  menu={data}
                >
                  {({dirty, isSubmitting}) => {
                    return (
                      <>
                        <HeaderLayout
                          title={headerTitle}
                          navigationAction={
                            <Link startIcon={<ArrowLeft/>} to={`/plugins/${pluginId}`}>
                              {formatMessage({
                                id: getTrad('ui.goBack'),
                                defaultMessage: 'Go back',
                              })}
                            </Link>
                          }
                          primaryAction={
                            <CheckPermissions permissions={pluginPermissions.createandupdate}>
                              <Button
                                type="submit"
                                disabled={!dirty || isSubmitting}
                                loading={isSubmitting}
                                startIcon={<Check/>}
                                size="L"
                              >
                                {formatMessage({
                                  id: getTrad('ui.save'),
                                  defaultMessage: 'Save',
                                })}
                              </Button>
                            </CheckPermissions>
                          }
                        />
                        <ContentLayout>
                          <Grid gap={4}>
                            <GridItem col={9} s={12}>
                              <Box paddingBottom={5}>
                                <Stack spacing={8}>
                                  <Section>
                                    <Box paddingTop={6}>
                                      <Typography variant="sigma" textColor="neutral600">
                                        Menu Information
                                      </Typography>
                                      <Box paddingTop={2} paddingBottom={6}>
                                        <Divider/>
                                      </Box>
                                      <Flex direction="column" alignItems="stretch" gaps={2}>
                                        <Box>
                                          <FormLayout
                                            fields={formLayout.menu}
                                            schema={schema.menu}
                                          />
                                        </Box>
                                      </Flex>
                                    </Box>
                                  </Section>
                                </Stack>
                              </Box>
                            </GridItem>
                            <GridItem col={3} s={12}>
                              <Box paddingBottom={5}>
                                <Stack spacing={8}>
                                  <Section>
                                    <Box paddingTop={6}>
                                      <Typography variant="sigma" textColor="neutral600">
                                        Internationalization
                                      </Typography>
                                      <Box paddingTop={2} paddingBottom={6}>
                                        <Divider/>
                                      </Box>
                                      <Flex direction="column" alignItems="stretch" gaps={2}>
                                        <Box paddingBottom={3}>
                                          <EditViewSelectLocale
                                            createPermissions={createPermissions}
                                            readPermissions={readPermissions}
                                            appLocales={locales}
                                            currentLocale={currentLocale}
                                            localizations={localizations}
                                            currentLocaleStatus={currentLocaleStatus}
                                          />
                                        </Box>
                                        <Box paddingBottom={3}>
                                          <EditViewCopyLocale
                                            appLocales={locales}
                                            currentLocale={currentLocale}
                                            localizations={localizations}
                                            readPermissions={readPermissions}
                                          />
                                        </Box>
                                        {!isCreating ?
                                          <>
                                            <Box paddingTop={2} paddingBottom={6}>
                                              <Divider/>
                                            </Box>
                                            <Box>
                                              <Flex direction="column" alignItems="stretch" gap={2}>
                                                <EditViewDeleteLink onDelete={onDeleteMenu} trackerProperty={id}/>
                                              </Flex>
                                            </Box>
                                          </>
                                          :
                                          <></>
                                        }
                                      </Flex>
                                    </Box>
                                  </Section>
                                </Stack>
                              </Box>
                            </GridItem>
                            <GridItem col={12}>
                              <Box paddingBottom={5}>
                                <Stack spacing={8}>
                                  <Section>
                                    <MenuItemsManager fields={menuItemLayout}/>
                                  </Section>
                                </Stack>
                              </Box>
                            </GridItem>
                          </Grid>
                        </ContentLayout>
                      </>
                    );
                  }}
                </MenuDataProvider>
              </Form>
            );
          }}
        </Formik>
      </Layout>
    </CheckPagePermissions>
  );
};

export default memo(EditView);
