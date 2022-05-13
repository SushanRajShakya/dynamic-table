import classNames from 'classnames';
import _isEqual from 'lodash.isequal';
import { connect } from 'react-redux';
import React, { useEffect, useState } from 'react';

import { svgIcon } from '../../../constants';
import { SvgIcon } from '../../../assets/svgIcon';
import { setOrderBy } from '../../../actions/filter';
import usePrevious from '../../../hooks/usePrevious';
import { withClickEventListener } from '../../../hoc/withClickEventListener';

const getOrderByConfig = (fieldName, value) => ({
  fieldName,
  value,
});

const GridDataCellHead = React.forwardRef((props, ref) => {
  const {
    elementWidth,
    cellData,
    fieldName,
    orderByConfig,
    setOrderBy,
    reloadData,
    isSortable,
    isLoading,
    isLazyLoading,
  } = props;

  const prevOrderByConfig = usePrevious(orderByConfig);

  const customClassNames = classNames({
    'sort-disabled': !isSortable,
  });

  const [sortIcon, setSortIcon] = useState(null);

  const _handleSort = () => {
    if (isSortable && !isLoading && !isLazyLoading) {
      if (!sortIcon) {
        setSortIcon(svgIcon.SORT_ARROW_DOWN);
        setOrderBy(getOrderByConfig(fieldName, 'desc'));
      } else if (sortIcon === svgIcon.SORT_ARROW_DOWN) {
        setSortIcon(svgIcon.SORT_ARROW_UP);
        setOrderBy(getOrderByConfig(fieldName, 'asc'));
      } else {
        setSortIcon(null);
        setOrderBy({});
      }
    }
  };

  useEffect(() => {
    if (orderByConfig.fieldName !== fieldName) {
      setSortIcon(prevState => (prevState ? null : prevState));
    } else {
      if (prevOrderByConfig && orderByConfig.fieldName && !_isEqual(prevOrderByConfig, orderByConfig)) {
        reloadData();
      }
    }
    if (_isEqual(prevOrderByConfig, getOrderByConfig(fieldName, 'asc')) && !orderByConfig?.fieldName) {
      reloadData();
    }
  }, [orderByConfig]);

  return (
    <div
      className={`data-cell ${customClassNames}`}
      style={{ width: `${elementWidth}px` }}
      onClick={_handleSort}
      ref={ref}>
      {cellData}
      {sortIcon && <SvgIcon name={sortIcon} />}
    </div>
  );
});

const mapStateToProps = state => ({
  orderByConfig: state.filters.orderByConfig,
  isLoading: state.ui.loading,
});

const mapDispatchToProps = dispatch => ({
  setOrderBy: config => {
    dispatch(setOrderBy(config));
  },
});

GridDataCellHead.displayName = 'GridDataCellHead';

export default connect(mapStateToProps, mapDispatchToProps)(withClickEventListener(GridDataCellHead));
