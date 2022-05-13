import _get from 'lodash.get';
import _isEqual from 'lodash.isequal';
import _isEmpty from 'lodash.isempty';

import { initializeUIConfig } from '../../../actions/ui';
import cacheService from '../../../services/accountCard';
import fetchRecords from '../../../services/dashboardFilter';
import { initializeErrorMsg } from '../../../actions/errorMsg';
import { handleError } from '../../../services/apiErrorHandler';
import { networkErrors } from '../../../constants/errorMessage';
import { initializeFilterUrl } from '../../../actions/filterUrl';
import fetchNextRecords from '../../../services/fetchNextRecords';
import sanitizeFilterData from '../../../services/sanitizeFilterData';
import { addDataRecord, resetData, setData } from '../../../actions/data';
import { initializeFilter, setDefaultFilter, setOrderBy } from '../../../actions/filter';

const dispatchFunctions = {
  resetData: dispatch => dispatch(resetData()),
  setData: (dispatch, data) => dispatch(setData(data)),
  setOrderBy: (dispatch, config) => dispatch(setOrderBy(config)),
  addDataRecord: (dispatch, data) => dispatch(addDataRecord(data)),
  initializeErrorMsg: (dispatch, msg) => dispatch(initializeErrorMsg(msg)),
  setDefaultFilter: (dispatch, filters) => dispatch(setDefaultFilter(filters)),
  initializeFilterUrl: (dispatch, value) => dispatch(initializeFilterUrl(value)),
  initializeFilter: (dispatch, filter, value) => dispatch(initializeFilter(filter, value)),
  initializeUIConfig: (dispatch, filter, value) => dispatch(initializeUIConfig(filter, value)),
};

const _getColumnWidth = (minWidth, width) => (width * minWidth) / 100;

const _getDefaultRecords = async (dispatch, initialUrl, errorMsg, defaultFilters) => {
  const records = await fetchRecords(
    initialUrl,
    sanitizeFilterData(defaultFilters),
    errorMsg,
    initialUrl.configUrl.initialLoadLimit
  );

  if (records.error) {
    handleError(records.error);
    dispatchFunctions.resetData(dispatch);
  } else if (records) {
    dispatchFunctions.setData(dispatch, records);
  }
};

const _getDefaultFilters = (dispatch, filterFields = {}, dashboardUIConfig) => {
  const filters = Object.values(filterFields);

  const recentFilters = cacheService.getMostRecentFilters(cacheService.getDashboardType(dashboardUIConfig));

  if (recentFilters?.length === filters.length) {
    const previousFilters = recentFilters.map(item => item.fieldName);
    const newFilters = filters.map(item => item.fieldName);

    if (_isEqual(previousFilters, newFilters)) {
      for (let i = 0; i < filters.length; i++) {
        if (_isEqual(Object.keys(recentFilters[i]), Object.keys(filters[i]))) {
          recentFilters[i] = { ...filters[i], ...recentFilters[i] };
        } else {
          return filters;
        }
      }

      dispatchFunctions.setDefaultFilter(dispatch, recentFilters);

      return recentFilters;
    }
  }

  return filters;
};

const _initialSetup = async (dispatch, filterConfig, dashboardUIConfig) => {
  const defaultErrorMsg = _get(filterConfig, 'errorMessage.defaultErrorMsg', '');

  window.document.title = dashboardUIConfig.title;
  dispatchFunctions.initializeUIConfig(dispatch, dashboardUIConfig);
  dispatchFunctions.initializeFilter(dispatch, Object.values(filterConfig.filterFields || {}));
  dispatchFunctions.initializeErrorMsg(dispatch, defaultErrorMsg);

  if (!_isEmpty(filterConfig)) {
    const initialUrl = {
      configUrl: {
        ...filterConfig.filterUrls,
        initialLoadUrl: `${filterConfig.filterUrls.initialLoadUrl}`,
      },
    };

    dispatchFunctions.initializeFilterUrl(dispatch, initialUrl.configUrl);
    const defaultFilters = _getDefaultFilters(dispatch, filterConfig.filterFields, dashboardUIConfig);

    await _getDefaultRecords(dispatch, initialUrl, defaultErrorMsg, defaultFilters);
  }
};

const _fetchDataFromNextLink = async props => {
  const { dispatch, records, setIsLazyLoading, errorMsg, filterUrl } = props;

  const nextLinkDetails = (records.hasMore && records.links && records.links.find(item => item.rel === 'next')) || null;

  if (nextLinkDetails) {
    const paginationSize = filterUrl.configUrl.paginationSize;

    setIsLazyLoading(true);
    const result = await fetchNextRecords(
      nextLinkDetails.href,
      _get(errorMsg, 'defaultErrorMsg', networkErrors.DEFAULT_ERROR),
      paginationSize
    );

    if (result.error) {
      handleError(result.error);
    } else {
      dispatchFunctions.addDataRecord(dispatch, result);
    }

    setIsLazyLoading(false);
  }
};

const _fetchDataWithFilter = ({
  filter,
  filterUrl,
  errorMsg,
  orderByConfig,
  ui,
  dispatch,
  setIsLoading,
  setSelectedRows,
}) => async () => {
  const initialLoadLimit = filterUrl.configUrl.initialLoadLimit;

  setIsLoading(true);
  setSelectedRows([]);
  dispatchFunctions.resetData(dispatch);
  const skipEmptyFilterValues = sanitizeFilterData(filter);
  const result = await fetchRecords(
    filterUrl,
    skipEmptyFilterValues,
    _get(errorMsg, 'defaultErrorMsg', networkErrors.DEFAULT_ERROR),
    initialLoadLimit,
    orderByConfig.fieldName ? orderByConfig : null
  );

  if (result.error) {
    handleError(result.error);
  }

  if (result) {
    dispatchFunctions.setData(dispatch, result);
    const dashboardType = cacheService.getDashboardType(ui);

    cacheService.clearDashboardRecentState(dashboardType);
    cacheService.storeFilterState(filter, dashboardType);
  }
  setIsLoading(false);
};

const _handleRowSelect = (selectedRows, setSelectedRows, rowIndex) => () => {
  if (selectedRows.includes(rowIndex)) {
    setSelectedRows(prevState => prevState.filter(val => val !== rowIndex));
  } else {
    setSelectedRows(prevState => [...prevState, rowIndex]);
  }
};

export {
  _initialSetup,
  _getColumnWidth,
  _handleRowSelect,
  _fetchDataWithFilter,
  _fetchDataFromNextLink,
  dispatchFunctions as tableDispatchFunctions,
};
