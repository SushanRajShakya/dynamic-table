import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { SvgIcon } from '../../../assets/svgIcon';
import { svgIcon, tableConstants } from '../../../constants';

const {
  checkBoxIconConfig: { color, height, width },
} = tableConstants;

const TableRowSelect = props => {
  const { onSelect, isSelected, isApproved, isDeclined } = props;

  const handleSelect = () => {
    if (!isDeclined && !isApproved) {
      onSelect();
    }
  };

  return (
    <div
      onClick={handleSelect}
      className={classNames(
        'table-body-row-cell-checkbox-wrapper',
        isSelected ? 'checkbox-selected' : '',
        isDeclined || isApproved ? 'checkbox-disabled' : ''
      )}>
      {(isSelected || isApproved) && <SvgIcon name={svgIcon.CHECK_MARK} height={height} width={width} color={color} />}
      {isDeclined && <SvgIcon name={svgIcon.CROSS_MARK} height={height} width={width} color={color} />}
    </div>
  );
};

TableRowSelect.propTypes = {
  onSelect: PropTypes.func,
  isSelected: PropTypes.bool,
  isApproved: PropTypes.bool,
  isDeclined: PropTypes.bool,
};

TableRowSelect.defaultProps = {
  isSelected: false,
  isApproved: false,
  isDeclined: false,
};

export { TableRowSelect };
