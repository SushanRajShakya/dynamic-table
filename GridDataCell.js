import PropTypes from 'prop-types';
import classNames from 'classnames';
import React, { Fragment } from 'react';

import { Can } from '../../common/Can';
import GridFileUpload from './GridFileUpload';
import * as dateUtils from '../../../utils/date';
import GridDataCellHead from './GridDataCellHead';
import { SvgIcon } from '../../../assets/svgIcon';
import GridMeatBallMenu from './GridMeatBallMenu';
import GridDataCellInput from './GridDataCellInput';
import { getFormattedDate } from '../../../utils/date';
import { getUserGroup } from '../../../utils/userInfo';
import GridDataCellDropdown from './GridDataCellDropdown';
import { textFormats } from '../../../constants/filterConstants';
import accessControlService from '../../../services/accessControl';
import { GRID_ROW_HEAD, GRID_ROW_DATA, DASH } from '../../../constants/app';
import { phoneNumberFormat, standardUSDformat } from '../../../utils/numberFormat';
import { CopyToClipboard, copyToClipboardType } from '../../common/copyToClipboard';
import {
  capitalizeAllFirstLetter,
  capitalizeFirstLetter,
  getTextContentFromDomElement,
} from '../../../utils/formatText';
import {
  CURRENCY,
  DATE,
  DROPDOWN,
  FILE_UPLOAD,
  HTML_TAG,
  LOCAL_TIME,
  MEAT_BALL_MENU,
  NUMBER,
  PHONE,
  displayTypes,
} from '../../../constants/stringType';

const handleFormat = (value, format) => {
  if (value) {
    switch (format) {
      case textFormats.UPPERCASE:
        return value.toUpperCase();
      case textFormats.LOWERCASE:
        return value.toLowerCase();
      case textFormats.YES_NO:
        return value.includes('_') ? capitalizeAllFirstLetter(value) : capitalizeFirstLetter(value);
      default:
        return value;
    }
  }

  return DASH;
};

const formatData = (type, value, format = null) => {
  const isObject = !!value && typeof value === 'object';
  const toUpdateValue = isObject ? value.value : value;

  const getResult = () => {
    switch (type) {
      case DATE:
        return getFormattedDate(toUpdateValue);
      case CURRENCY:
        return toUpdateValue !== null && toUpdateValue >= 0 ? standardUSDformat(toUpdateValue) : DASH;
      case PHONE:
        return phoneNumberFormat(toUpdateValue);
      case NUMBER:
        return toUpdateValue !== null && toUpdateValue >= 0 ? toUpdateValue : DASH;
      case HTML_TAG:
        return toUpdateValue ? getTextContentFromDomElement(toUpdateValue) : DASH;
      case LOCAL_TIME:
        return dateUtils.getLocalTimeFromZipCode(toUpdateValue);
      case FILE_UPLOAD:
        return toUpdateValue || '';
      default:
        return handleFormat(value, format);
    }
  };

  return isObject ? { ...value, value: getResult() } : getResult();
};

const _getInputComponent = (data, column, rowType, updateRow, dashboardMode, reloadData, innerRef) => {
  switch (column.type) {
    case DROPDOWN:
      return (
        <GridDataCellDropdown
          data={data}
          column={column}
          innerRef={innerRef}
          rowType={rowType}
          updateRow={updateRow}
          mode={dashboardMode}
        />
      );
    case FILE_UPLOAD:
      return (
        <GridFileUpload
          data={data}
          column={column}
          rowType={rowType}
          updateRow={updateRow}
          mode={dashboardMode}
          innerRef={innerRef}
        />
      );
    default:
      return (
        <GridDataCellInput data={data} column={column} rowType={rowType} updateRow={updateRow} mode={dashboardMode} />
      );
  }
};

const _getColumnWidth = (column, minGridWidth) => (column.width * minGridWidth) / 100;

const DisplayComponent = ({ formattedData, isCopyable, displayType, suffixIcon }) => {
  const getDisplayValue = () => {
    if (formattedData === DASH) {
      return formattedData;
    }

    switch (displayType) {
      case displayTypes.SUFFIX_ICON:
        return (
          <>
            {formattedData}&nbsp;
            <SvgIcon name={suffixIcon} />
          </>
        );
      case displayTypes.CONCAT_DATA:
        return (
          <>
            {formattedData.value}
            {formattedData.additionalValues.map((val, ind) => (
              <Fragment key={ind}>
                &nbsp;<span className={val.className}>{val.value}</span>
              </Fragment>
            ))}
          </>
        );
      default:
        return <>{formattedData}</>;
    }
  };

  return (
    <>
      {getDisplayValue()}
      {isCopyable && formattedData !== DASH && (
        <span className="data-cell-copy-wrapper">
          <CopyToClipboard type={copyToClipboardType.ICON} text={formattedData} />
        </span>
      )}
    </>
  );
};

const GridDataCell = ({
  data,
  column,
  rowType,
  dashboardMode,
  reloadData,
  dataIndex,
  minGridWidth,
  isLazyLoading,
  updateRow,
  innerRef,
}) => {
  const cellData =
    rowType === GRID_ROW_HEAD
      ? column.title
      : column.concatData
      ? {
          value: data[column.dataColumn],
          additionalValues: column.concatData.map(con => ({
            value: data[con.dataColumn] ? con.getConCatValue(data[con.dataColumn]) : null,
            className: con.className,
          })),
        }
      : data[column.dataColumn || column.label];

  const customClassNames = classNames({
    'grid-dropdown': column.type === DROPDOWN,
    'grid-file-upload': column.type === FILE_UPLOAD,
    editable: column.editable,
    'grid-meat-ball-menu': column.type === MEAT_BALL_MENU,
    static: !column.editable,
    copyable: column.isCopyable,
  });

  const elementWidth = _getColumnWidth(column, minGridWidth);

  if (rowType === GRID_ROW_DATA) {
    const formattedData = formatData(column.type, cellData, column.format);
    const isFormattedDataString = typeof formattedData === 'string';

    switch (column.type) {
      case MEAT_BALL_MENU:
        return (
          <div className={`data-cell ${customClassNames}`} style={{ width: `${elementWidth}px` }}>
            <GridMeatBallMenu innerRef={innerRef} column={column} data={data} />
          </div>
        );
      default:
        return (
          <Can
            role={getUserGroup()}
            action={accessControlService.getAccessActionTitles(dashboardMode)}
            yes={() => {
              return (
                <div className={`data-cell ${customClassNames}`} style={{ width: `${elementWidth}px` }}>
                  {column.editable ? (
                    _getInputComponent(data, column, rowType, updateRow, dashboardMode, reloadData, innerRef)
                  ) : (
                    <DisplayComponent {...column} formattedData={formattedData} />
                  )}
                </div>
              );
            }}
            no={() => {
              return (
                <div
                  title={isFormattedDataString ? formattedData : formattedData.formattedDate}
                  className={`data-cell static ${column.isCopyable ? 'copyable' : ''}`}
                  style={{ width: `${elementWidth}px` }}>
                  <DisplayComponent {...column} formattedData={formattedData} />
                </div>
              );
            }}
          />
        );
    }
  } else {
    return (
      <GridDataCellHead
        elementWidth={dataIndex === 0 ? elementWidth + 10 : elementWidth}
        cellData={cellData}
        fieldName={column.sortColumn || column.dataColumn || column.label}
        reloadData={reloadData}
        isSortable={!column.disableSort}
        isLazyLoading={isLazyLoading}
      />
    );
  }
};

GridDataCell.propTypes = {
  column: PropTypes.object.isRequired,
  rowType: PropTypes.string.isRequired,
  dataIndex: PropTypes.number.isRequired,
  data: PropTypes.object,
  dashboardMode: PropTypes.string,
  reloadData: PropTypes.func,
  minGridWidth: PropTypes.number.isRequired,
  isLazyLoading: PropTypes.bool,
};

export default GridDataCell;
