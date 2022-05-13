import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import GridDataCell from './GridDataCell';
import routes from '../../../constants/routes';
import { resetUIConfig } from '../../../actions/ui';
import { setSelectedRows } from '../../../actions/grid';
import { GRID_ROW_DATA, GRID_ROW_HEAD } from '../../../constants/app';
import { APPROVED, REJECTED, RELEASED, ERRORED, SENT } from '../constants/label';

const GridRow = ({
  gridType,
  minGridWidth,
  updateRow,
  data,
  rowId,
  rowClass,
  dashboardMode,
  reloadData,
  history,
  selectedRows,
  setSelectedRows,
  resetUIConfig,
  hasWriteAccess,
  isLazyLoading,
  innerRef,
}) => {
  const rowType = data ? GRID_ROW_DATA : GRID_ROW_HEAD;
  const disabledStatus = [APPROVED, RELEASED, SENT];
  const crossMarkedStatus = [REJECTED, ERRORED];
  const isRowSelectionDisabled = [...disabledStatus, ...crossMarkedStatus].includes(data?.release_status);

  const gridData = getGridDataCell(
    data,
    gridType,
    rowType,
    updateRow,
    dashboardMode,
    reloadData,
    minGridWidth,
    isLazyLoading,
    innerRef
  );

  return (
    <div
      className={`grid ${rowClass}`}
      style={{ minWidth: `${minGridWidth}px` }}
      onClick={e => {
        if (e.target.classList.contains('data-cell')) {
          openDetailsView(data, history, rowType, resetUIConfig);
        }
      }}>
      {gridType.hasRowSelection && data && (
        <label className={classNames('checkbox-container', { disabled: isRowSelectionDisabled })}>
          <input
            type="checkbox"
            checked={isRowSelectionDisabled || selectedRows.includes(rowId)}
            onChange={() => {
              updateRowSelection(rowId, selectedRows, setSelectedRows);
            }}
            disabled={!hasWriteAccess || disabledStatus.includes(data.release_status)}
          />
          {crossMarkedStatus.includes(data.release_status) ? (
            <span className={'cross-mark'}>X</span>
          ) : (
            <span className={classNames('checkmark', { disabled: isRowSelectionDisabled })} />
          )}
        </label>
      )}
      {gridData}
    </div>
  );
};

const getGridDataCell = (
  data,
  gridType,
  rowType,
  updateRow,
  dashboardMode,
  reloadData,
  minGridWidth,
  isLazyLoading,
  innerRef
) => {
  return gridType.columns.map((column, i) => (
    <GridDataCell
      key={i}
      data={data}
      reloadData={reloadData}
      column={column}
      minGridWidth={minGridWidth}
      rowType={rowType}
      dataIndex={i}
      updateRow={updateRow}
      dashboardMode={dashboardMode}
      isLazyLoading={isLazyLoading}
      innerRef={innerRef}
    />
  ));
};

const openDetailsView = (data, history, rowType, resetUIConfig) => {
  if (rowType === GRID_ROW_DATA) {
    switch (history.location.pathname) {
      case routes.TITLES_GENERAL:
        data.application_id &&
          resetUIConfig() &&
          history.push(`${routes.TITLES_GENERAL_DETAILS.replace(':id', data.application_id)}`);
        break;
      case routes.TITLES_RELEASE:
        data.application_id &&
          resetUIConfig() &&
          history.push(`${routes.TITLES_RELEASE_DETAILS.replace(':id', data.application_id)}`);
        break;
      case routes.TITLES_REMARKETING:
        data.application_id &&
          resetUIConfig() &&
          history.push(`${routes.TITLES_REMARKETING_DETAILS.replace(':id', data.application_id)}`);
        break;
      case routes.TITLES_MISSING_TITLES_DEALER:
        data.dealer_id &&
          resetUIConfig() &&
          history.push(`${routes.TITLES_MISSING_TITLES_DETAILS.replace(':id', data.dealer_id)}`);
        break;
      case routes.TITLES_MISSING_TITLES_CLIENT:
        data.cyberridge_loan_number &&
          history.push(`${routes.TITLES_MISSING_TITLES_CLIENT_DETAILS.replace(':id', data.application_id)}`);
        break;
      default:
        break;
    }
  }
};

const updateRowSelection = (rowId, selectedRow, setSelectedRow) => {
  const rowIndex = selectedRow.indexOf(rowId);

  if (rowIndex >= 0) {
    setSelectedRow(selectedRow.filter(item => item !== rowId));
  } else {
    setSelectedRow([...selectedRow, rowId]);
  }
};

const mapStateToProps = state => ({
  selectedRows: state.grid.selectedRows,
});

const mapDispatchToProps = dispatch => ({
  setSelectedRows: rows => dispatch(setSelectedRows(rows)),
  resetUIConfig: () => dispatch(resetUIConfig()),
});

GridRow.propTypes = {
  gridType: PropTypes.object.isRequired,
  rowClass: PropTypes.string.isRequired,
  data: PropTypes.object,
  dashboardMode: PropTypes.string,
  reloadData: PropTypes.func,
  history: PropTypes.object.isRequired,
  minGridWidth: PropTypes.number.isRequired,
  rowId: PropTypes.number,
  selectedRows: PropTypes.array,
  setSelectedRows: PropTypes.func,
  resetUIConfig: PropTypes.func,
  updateRow: PropTypes.func,
  hasWriteAccess: PropTypes.bool,
  isLazyLoading: PropTypes.bool,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(GridRow));
