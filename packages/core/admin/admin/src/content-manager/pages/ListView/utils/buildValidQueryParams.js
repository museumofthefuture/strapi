import set from 'lodash/set';

import createPluginsFilter from './createPluginsFilter';

/**
 * Creates a valid query params object
 * This includes:
 * - a filters clause
 * - plugin options
 */
const buildValidQueryParams = (queryParams = {}) => {
  /**
   * Extracting pluginOptions from the query since we don't want them to be part
   * of the url
   */
  const {
    plugins: _,
    _q: query,
    ...otherQueryParams
  } = {
    ...queryParams,
    ...createPluginsFilter(queryParams.plugins),
  };

  if (query) {
    set(otherQueryParams, `_q`, encodeURIComponent(query));
  }

  return otherQueryParams;
};

export default buildValidQueryParams;
