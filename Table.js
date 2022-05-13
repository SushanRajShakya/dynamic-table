import PropTypes from 'prop-types';
import classNames from 'classnames';
import _isEqual from 'lodash.isequal';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import LoadingView from '../loadingView';
import { TableNoData } from './TableNoData';
import { TableHeadCell } from './TableHeadCell';
import { TableRowSelect } from './TableRowSelect';
import { tableConstants } from '../../../constants';
import { TableCellNonEditable } from './TableCellNonEditable';
import { FlexContainer, flexJustify } from '../FlexContainer';
import {
  _fetchDataFromNextLink,
  _initialSetup,
  _fetchDataWithFilter,
  _getColumnWidth,
  _handleRowSelect,
} from './tableFunctions';

const { editableType } = tableConstants;

const TableGrid = props => {
  const {
    tableConfig: { minWidth, columnConfig, selectable = false, selectableConfig },
    filterConfig,
    dashboardUIConfig,
    selectedRows,
    setSelectedRows,
  } = props;

  const dispatch = useDispatch();

  const ui = useSelector(state => state.ui);
  const errorMsg = useSelector(state => state.errorMsg);
  const tableData = useSelector(state => state.data.data);
  const filterUrl = useSelector(state => state.filterUrl);
  const { filter, orderByConfig } = useSelector(state => state.filters);

  const refRecords = useRef(1);
  const fetchingLazy = useRef(false);
  const refTableWrapper = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLazyLoading, setIsLazyLoading] = useState(false);

  const hasData = useMemo(() => tableData.items?.length > 0, [tableData]);

  const _handleScrollEvent = async () => {
    if (
      Math.ceil(refTableWrapper.current.scrollTop) + refTableWrapper.current.clientHeight >=
        refTableWrapper.current.scrollHeight &&
      !fetchingLazy.current
    ) {
      fetchingLazy.current = true;
      await _fetchDataFromNextLink({ dispatch, records: refRecords.current, setIsLazyLoading, errorMsg, filterUrl });
      fetchingLazy.current = false;
    }
  };

  useEffect(() => {
    if (hasData && !_isEqual(refRecords.current, tableData)) {
      refRecords.current = tableData;
    }
  }, [tableData]);

  useEffect(() => {
    refTableWrapper.current.addEventListener('scroll', _handleScrollEvent);
    (async () => {
      setIsLoading(true);
      await _initialSetup(dispatch, filterConfig, dashboardUIConfig);
      setIsLoading(false);
    })();
  }, []);

  return (
    <div className={'table-container'}>
      <div ref={refTableWrapper} className={'table-wrapper'} style={{ minWidth }}>
        {isLoading && (
          <FlexContainer classList="table-main-loader" justify={flexJustify.CENTER} fill>
            <LoadingView />
          </FlexContainer>
        )}
        <FlexContainer classList={'table-head-wrapper'} fill>
          {selectable && (
            <div className="table-head-cell" style={{ width: _getColumnWidth(minWidth, selectableConfig.width) }} />
          )}
          {columnConfig.map(col => (
            <TableHeadCell
              key={col.title}
              minWidth={minWidth}
              column={col}
              isLazyLoading={isLazyLoading}
              reloadData={_fetchDataWithFilter({
                filter,
                filterUrl,
                errorMsg,
                orderByConfig,
                ui,
                dispatch,
                setIsLoading,
                setSelectedRows,
              })}
            />
          ))}
        </FlexContainer>
        <div className={classNames('table-body-wrapper', !hasData ? 'table-body-wrapper-no-data' : '')}>
          {!isLoading ? (
            hasData ? (
              tableData.items.map((data, index) => (
                <FlexContainer key={index} classList={'table-body-row'} fill>
                  {selectable && (
                    <div
                      className={classNames('table-body-row-cell')}
                      style={{ width: _getColumnWidth(minWidth, selectableConfig.width) }}>
                      <TableRowSelect
                        onSelect={_handleRowSelect(selectedRows, setSelectedRows, index)}
                        isSelected={selectedRows.includes(index)}
                        isApproved={selectableConfig.approveCases.includes(data[selectableConfig.dataColumn])}
                        isDeclined={selectableConfig.declineCases.includes(data[selectableConfig.dataColumn])}
                      />
                    </div>
                  )}
                  {columnConfig.map(col => (
                    <div
                      key={`${data.id}_${col.dataColumn}`}
                      style={{ width: _getColumnWidth(minWidth, col.width) }}
                      className={classNames('table-body-row-cell')}>
                      <TableCellNonEditable data={data} column={col} />
                    </div>
                  ))}
                </FlexContainer>
              ))
            ) : (
              <TableNoData />
            )
          ) : (
            <></>
          )}
          {hasData && isLazyLoading && (
            <FlexContainer classList={'table-body-lazy-loading-wrapper'} fill justify={flexJustify.CENTER}>
              <LoadingView />
            </FlexContainer>
          )}
        </div>
      </div>
    </div>
  );
};

TableGrid.propTypes = {
  onSave: PropTypes.func,
  tableConfig: PropTypes.object,
  filterConfig: PropTypes.object,
  hasWriteAccess: PropTypes.bool,
  dashboardUIConfig: PropTypes.object,
  selectedRows: PropTypes.array,
  setSelectedRows: PropTypes.func,
  editType: PropTypes.oneOf([editableType.MULTIPLE, editableType.SINGLE]),
};

export default TableGrid;
