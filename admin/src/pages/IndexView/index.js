import React, {memo, useEffect, useMemo, useState} from 'react';
import {useIntl} from 'react-intl';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import get from 'lodash/get';
import {DynamicTable, EmptyStateLayout, useNotification, useOverlayBlocker, useQueryParams, CheckPermissions, SearchURLQuery} from '@strapi/helper-plugin';
import {useNotifyAT, IconButton, Main, Box, ActionLayout, ContentLayout, HeaderLayout, Button, Select, Option} from '@strapi/design-system';
import {Plus} from '@strapi/icons';
import selectI18NLocales from "@strapi/plugin-i18n/admin/src/selectors/selectI18nLocales";

import {api, getTrad, pluginId, pluginName} from '../../utils';
import {Layout, MenuRows, PaginationFooter} from '../../components';
import {useSelector} from "react-redux";
import Bullet from "@strapi/plugin-i18n/admin/src/components/CMEditViewInjectedComponents/CMEditViewLocalePicker/Bullet";
import {createLocalesOption} from "@strapi/plugin-i18n/admin/src/components/CMEditViewInjectedComponents/CMEditViewLocalePicker/utils";

const QUERY_KEY = 'menus-index';

const IndexView = ({history}) => {
  const {formatMessage} = useIntl();
  const {notifyStatus} = useNotifyAT();
  const toggleNotification = useNotification();
  const {lockApp, unlockApp} = useOverlayBlocker();
  const queryClient = useQueryClient();
  const [{query}] = useQueryParams();

  const locales = useSelector(selectI18NLocales);
  const defaultLocale = locales.find((loc) => loc.isDefault);
  const [currentLocale, setCurrentLocale] = useState(defaultLocale);

  let currentLocaleCode = get(query, 'plugins.i18n.locale', defaultLocale.code);
  let _currentLocale = locales.find((loc) => loc.code === currentLocaleCode);
  let filteredOptions = locales.filter((value) => value.code !== currentLocaleCode);

  useMemo(() => {
    setCurrentLocale(_currentLocale);
  }, [locales, _currentLocale])

  const pageSize = get(query, 'pageSize', 10);
  const page = (get(query, 'page', 1) * pageSize) - pageSize;

  const fetchParams = {
    populate: '*',
    // locale:"vi",
    pagination: {
      start: page,
      limit: pageSize,
    },
  };

  const {data, refetch, status} = useQuery(QUERY_KEY, () => api.get(null, fetchParams), {
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

  // useEffect( () => refetch(), [ page, pageSize ] );

  const deleteMutation = useMutation(id => api.deleteAction(id), {
    onSuccess: async () => {
      await queryClient.invalidateQueries(QUERY_KEY);

      toggleNotification({
        type: 'success',
        message: {
          id: getTrad('ui.deleted.menu'),
          defaultMessage: 'Menu has been deleted',
        },
      });
    },
    onError: err => {
      if (err?.response?.data?.data) {
        toggleNotification({
          type: 'warning',
          message: err.response.data.data,
        });
      } else {
        toggleNotification({
          type: 'warning',
          message: {
            id: getTrad('ui.error'),
            defaultMessage: 'An error occured',
          },
        });
      }
    },
    onSettled: () => {
      unlockApp();
    },
  });

  const onConfirmDelete = async id => {
    lockApp();

    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      unlockApp();
    }
  };

  const isLoading = status !== 'success';
  const colCount = 4;
  const rowCount = (data?.data?.length ?? 0) + 1;
  const pageCount = data?.meta?.total ? Math.ceil(data.meta.total / data.meta.limit) : 1;

  const tableHeaders = [
    {
      name: 'title',
      key: 'title',
      metadatas: {
        label: formatMessage({
          id: getTrad('form.label.title'),
          defaultMessage: 'Title',
        }),
        sortable: true,
      },
    },
    {
      name: 'slug',
      key: 'slug',
      metadatas: {
        label: formatMessage({
          id: getTrad('form.label.slug'),
          defaultMessage: 'Slug',
        }),
        sortable: true,
      },
    },
    {
      name: 'items',
      key: 'items',
      metadatas: {
        label: formatMessage({
          id: getTrad('form.label.items'),
          defaultMessage: 'Items',
        }),
        sortable: false,
      },
    },
    {
      name: 'locale',
      key: 'locale',
      metadatas: {
        label: formatMessage({
          id: getTrad('form.label.locale'),
          defaultMessage: 'Locale',
        }),
        sortable: true,
      },
    },
    {
      name: 'state',
      key: 'state',
      metadatas: {
        label: formatMessage({
          id: getTrad('form.label.state'),
          defaultMessage: 'State',
        }),
        sortable: true,
      },
    },
  ];

  /**
   * @TODO - This primary action currently does not render when the `DynamicTable`
   * passes the `action` prop through to `EmptyStateLayout`. No idea why.
   */
  const PrimaryAction = ({size = 'L', variant = 'default',}) => (
    <Button
      onClick={() => history.push(`/plugins/${pluginId}/create`)}
      startIcon={<Plus/>}
      variant={variant}
      size={size}
    >
      {formatMessage({
        id: getTrad('ui.create.menu'),
        defaultMessage: 'Create new menu',
      })}
    </Button>
  );

  async function handleLocaleChange(locale) {
    _currentLocale = locales.find((loc) => loc.code === locale);
     setCurrentLocale(_currentLocale)

    fetchParams.locale = locale;
    await refetch();
  }


  return (
    <Layout
      isLoading={isLoading}
      title={formatMessage({
        id: getTrad('plugin.name'),
        defaultMessage: pluginName,
      })}
    >
      <HeaderLayout
        title={formatMessage({
          id: getTrad('plugin.name'),
          defaultMessage: pluginName,
        })}
        subtitle={formatMessage({
          id: getTrad('index.header.subtitle'),
          defaultMessage: 'Customize the structure of menus and menu items',
        })}
        primaryAction={<PrimaryAction/>}
      />
      <ActionLayout
        startActions={<></>}
        endActions={
          <>
            <Select
              label={'Select locales'}
              onChange={handleLocaleChange}
              value={currentLocale.code}
            >
              <Option
                value={_currentLocale.code}
              >
                {_currentLocale.name}
              </Option>
              {filteredOptions.map((option) => {
                return (
                  <Option
                    key={option.code}
                    value={option.code}
                  >
                    {option.name}
                  </Option>
                );
              })}
            </Select>
          </>
        }
      />
      <ContentLayout>
        <Box paddingBottom={10}>
          {!!data?.data?.length ? (
            <>
              <DynamicTable
                contentType="menus"
                isLoading={isLoading}
                headers={tableHeaders}
                rows={data.data}
                action={<PrimaryAction size="S" variant="secondary"/>}
                onConfirmDelete={onConfirmDelete}
              >
                <MenuRows
                  data={data.data ?? []}
                  onClickClone={id => history.push(`/plugins/${pluginId}/clone/${id}`)}
                  onClickEdit={id => history.push(`/plugins/${pluginId}/edit/${id}`)}
                />
              </DynamicTable>
              <PaginationFooter pagination={{pageCount}}/>
            </>
          ) : (
            <EmptyStateLayout
              content={{
                id: getTrad('index.state.empty'),
                defaultMessage: 'No menus found',
              }}
              action={<PrimaryAction size="S" variant="secondary"/>}
            />
          )}
        </Box>
      </ContentLayout>
    </Layout>
  );
};

export default memo(IndexView);
