import React, {Suspense} from 'react';
import {Switch, Route} from 'react-router-dom';
import {QueryClientProvider, QueryClient} from 'react-query';
import {Layout} from '@strapi/design-system';
import {LoadingIndicatorPage, CheckPagePermissions} from '@strapi/helper-plugin';

import {pluginId} from '../../utils';
import EditView from '../EditView';
import IndexView from '../IndexView';
import NotFound from '../NotFound';
import pluginPermissions from '../../permissions';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {

  return (
    <CheckPagePermissions permissions={pluginPermissions.read}>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Suspense fallback={<LoadingIndicatorPage/>}>
            <Switch>
              <Route path={`/plugins/${pluginId}`} component={IndexView} exact/>
              <Route path={`/plugins/${pluginId}/create`} component={EditView} exact/>
              <Route path={`/plugins/${pluginId}/clone/:id`} component={EditView} exact/>
              <Route path={`/plugins/${pluginId}/edit/:id`} component={EditView} exact/>
              <Route path="" component={NotFound}/>
            </Switch>
          </Suspense>
        </Layout>
      </QueryClientProvider>
    </CheckPagePermissions>
  );
};

export default App;
