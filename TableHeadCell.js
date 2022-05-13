import PropTypes from 'prop-types';
import _isEqual from 'lodash.isequal';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { usePrevious } from '../../../hooks';
import { svgIcon } from '../../../constants';
import { SvgIcon } from '../../../assets/svgIcon';
import { _getColumnWidth, tableDispatchFunctions } from './tableFunctions';

const TableHeadCell = props => {
  const { minWidth, reloadData, column, isLazyLoading } = props;
  const { width, title, dataColumn, sortable = true, sortColumn } = column;

  const fieldName = sortColumn || dataColumn;

  const dispatch = useDispatch();

  const isLoading = useSelector(state => state.ui.loading);
  const orderByConfig = useSelector(state => state.filters.orderByConfig);

  const [sortIcon, setSortIcon] = useState(null);

  const prevOrderByConfig = usePrevious(orderByConfig);

  useEffect(() => {
    if (orderByConfig.fieldName !== fieldName) {
      setSortIcon(prevState => (prevState ? null : prevState));
    } else {
      if (prevOrderByConfig && orderByConfig.fieldName && !_isEqual(prevOrderByConfig, orderByConfig)) {
        reloadData();
      }
    }
    if (_isEqual(prevOrderByConfig, _getOrderByConfig(fieldName, 'asc')) && !orderByConfig?.fieldName) {
      reloadData();
    }
  }, [orderByConfig]);

  return (
    <div
      style={{ width: _getColumnWidth(minWidth, width) }}
      className={'table-head-cell'}
      onClick={_handleSort(dispatch, sortable, isLoading, isLazyLoading, sortIcon, setSortIcon, fieldName)}>
      {title}
      {svgIcon && (
        <span>
          <SvgIcon name={sortIcon} />
        </span>
      )}
    </div>
  );
};

const _getOrderByConfig = (fieldName, value) => ({
  fieldName,
  value,
});

const _handleSort = (dispatch, sortable, isLoading, isLazyLoading, sortIcon, setSortIcon, fieldName) => e => {
  e.preventDefault();
  if (sortable && !isLoading && !isLazyLoading) {
    if (!sortIcon) {
      setSortIcon(svgIcon.SORT_ARROW_DOWN);
      tableDispatchFunctions.setOrderBy(dispatch, _getOrderByConfig(fieldName, 'desc'));
    } else if (sortIcon === svgIcon.SORT_ARROW_DOWN) {
      setSortIcon(svgIcon.SORT_ARROW_UP);
      tableDispatchFunctions.setOrderBy(dispatch, _getOrderByConfig(fieldName, 'asc'));
    } else {
      setSortIcon(null);
      tableDispatchFunctions.setOrderBy(dispatch, {});
    }
  }
};

TableHeadCell.propTypes = {
  minWidth: PropTypes.number.isRequired,
  reloadData: PropTypes.func,
  column: PropTypes.object,
  isLazyLoading: PropTypes.bool,
};

export { TableHeadCell };
