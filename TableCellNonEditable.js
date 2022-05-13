import React from 'react';
import PropTypes from 'prop-types';
import _isEmpty from 'lodash.isempty';

import { DASH } from '../../../constants/app';
import { SvgIcon } from '../../../assets/svgIcon';
import { tableConstants } from '../../../constants';
import { CopyToClipboard, copyToClipboardType } from '../copyToClipboard';
import { getFormattedDate, getLocalTimeFromZipCode } from '../../../utils/date';
import { phoneNumberFormat, standardUSDformat } from '../../../utils/numberFormat';
import { capitalizeAllFirstLetter, capitalizeFirstLetter } from '../../../utils/formatText';

const TableCellNonEditable = ({ column, data }) => {
  const value = _getValueOfType(data[column.dataColumn], column.type, column.format);
  const hasValue = value !== DASH;

  return (
    <>
      {hasValue && column.copyable && (
        <span {...Object.assign({}, hasValue ? { title: value } : null)} className="table-body-row-cell-copy-wrapper">
          <CopyToClipboard text={value} type={copyToClipboardType.ICON} />
        </span>
      )}
      {hasValue && column.prefixIcon && (
        <span className="table-body-row-cell-prefix-icon">
          <SvgIcon name={column.prefixIcon} />
        </span>
      )}
      <span {...Object.assign({}, hasValue ? { title: value } : null)} className={'table-body-row-cell-value'}>
        {value}
      </span>
      {hasValue && column.suffixIcon && (
        <span className="table-body-row-cell-suffix-icon">
          <SvgIcon name={column.suffixIcon} />
        </span>
      )}
    </>
  );
};

const _getFormattedValue = (value, format) => {
  switch (format) {
    case tableConstants.dataFormat.TITLE_CASE:
      return capitalizeAllFirstLetter(value);
    case tableConstants.dataFormat.UPPERCASE:
      return value.toUpperCase();
    case tableConstants.dataFormat.LOWERCASE:
      return value.toLowerCase();
    case tableConstants.dataFormat.CAPITALIZE:
      return capitalizeFirstLetter(value);
    default:
      return value;
  }
};

const _getValueOfType = (value, type, format) => {
  if (!value || (isNaN(value) && _isEmpty(value))) {
    return DASH;
  }

  switch (type) {
    case tableConstants.dataType.NUMBER:
      return value >= 0 ? value : DASH;
    case tableConstants.dataType.PHONE:
      return phoneNumberFormat(value);
    case tableConstants.dataType.CURRENCY:
      return value >= 0 ? standardUSDformat(value) : DASH;
    case tableConstants.dataType.DATE:
      return getFormattedDate(value);
    case tableConstants.dataType.LOCAL_TIME:
      return getLocalTimeFromZipCode(value);
    default:
      return _getFormattedValue(value, format);
  }
};

TableCellNonEditable.propTypes = {
  column: PropTypes.object,
  data: PropTypes.object,
};

export { TableCellNonEditable };
