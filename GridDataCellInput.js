import classNames from 'classnames';
import _isEmpty from 'lodash.isempty';
import React, { useEffect, useState } from 'react';

import { keyCode } from '../../../constants/keyCode';
import { NUMBER } from '../../../constants/stringType';
import { httpConstants } from '../../../constants/network';
import { notifyError } from '../../../utils/notifications';
import { DASH, SUCCESS_TIMER } from '../../../constants/app';
import { validationErrors } from '../../../constants/errorMessage';
import * as filterConstants from '../../../constants/filterConstants';
import { withClickEventListener } from '../../../hoc/withClickEventListener';

const _handleChange = (e, setValue, column) => {
  const enteredValue = e.target.value;
  const { type, maxLength } = column;

  if (type === NUMBER) {
    _validateNum(enteredValue) && setValue(enteredValue);
  } else {
    const valueLength = e.target.value.trim().length;

    if (valueLength > maxLength) {
      notifyError(column.dataColumn, validationErrors.MAX_LENGTH_EXCEEDED(maxLength));
    } else {
      setValue(enteredValue);
    }
  }
};

const _handleSuccess = (responseData, setSaved) => {
  setSaved(responseData.status === httpConstants.statusCode.SUCCESS ? 'active' : '');
  const successTimer = setTimeout(() => {
    setSaved('');
    clearTimeout(successTimer);
  }, SUCCESS_TIMER);
};

const _handleKeyDown = (event, handleUpdate, ref) => {
  if (event.key === keyCode.ENTER || event.key === keyCode.TAB) {
    event.preventDefault();
    ref.current.blur();
    handleUpdate();
  }
};

const _isNumberKey = event => {
  const charCode = event.which ? event.which : event.keyCode;

  if (
    (charCode < filterConstants.ASCII_VALUE_FOR_0 || charCode > filterConstants.ASCII_VALUE_FOR_9) &&
    charCode !== filterConstants.ASCII_VALUE_FOR_DOT
  ) {
    event.preventDefault();

    return false;
  }

  return true;
};

const _validateNum = value => {
  if (!_isEmpty(value)) {
    const result = value.split('.');

    return !isNaN(value) && result.length < 3;
  }

  return true;
};

const _handleFocusTextInput = event => {
  event.target.select(); // select entire text in input.
};

const GridDataCellInput = React.forwardRef((props, ref) => {
  const { data, column, updateRow, selected, setSelected } = props;

  let defaultValue = data[column.dataColumn] ? data[column.dataColumn].toString() : '';

  const [value, setValue] = useState(defaultValue);
  const [saved, setSaved] = useState('');

  const customClassNames = classNames({
    selected,
    currency: column.isCurrency,
  });

  const handleUpdate = async () => {
    if (value.trim() !== defaultValue) {
      if (column.type === NUMBER && value.trim() === '.') {
        setValue(defaultValue);
        selected && setSelected(false);

        return;
      }

      const response = await updateRow(data, column.dataColumn, value.trim());

      if (response.error) {
        setValue(defaultValue);
      } else {
        _handleSuccess(response, setSaved);
      }
      selected && setSelected(false);
    }
  };

  useEffect(() => {
    defaultValue = data[column.dataColumn] ? data[column.dataColumn].toString() : '';
    value.trim() !== defaultValue.trim() && setValue(defaultValue);
  }, [data]);

  useEffect(() => {
    if (!selected) {
      /* eslint-disable */
      if (!(value === '' && data[column.dataColumn] == null)) {
        if (value.trim() != defaultValue) {
          handleUpdate();
        }
      }
      /* eslint-enable */
    }
  }, [selected]);

  return (
    <div className={`${customClassNames} cell-input-wrapper`}>
      {column.isCurrency && <span className="prefix">{value || selected ? '$' : DASH}</span>}
      {column.type === NUMBER ? (
        <input
          ref={ref}
          name="dataCellInput"
          type="text"
          placeholder={column.isCurrency ? '' : DASH}
          autoComplete="off"
          onFocus={e => _handleFocusTextInput(e)}
          onChange={e => _handleChange(e, setValue, column)}
          onKeyPress={column.type === NUMBER ? _isNumberKey : () => true}
          onKeyDown={e => _handleKeyDown(e, handleUpdate, ref)}
          maxLength={column.maxLength}
          value={value}
          className={`${customClassNames} ${saved}`}
        />
      ) : (
        <input
          ref={ref}
          name="dataCellInput"
          type="text"
          placeholder={DASH}
          autoComplete="off"
          onFocus={e => _handleFocusTextInput(e)}
          onChange={e => _handleChange(e, setValue, column)}
          onKeyDown={e => _handleKeyDown(e, handleUpdate, ref)}
          value={value}
          className={`${customClassNames} ${saved}`}
        />
      )}
      <div className={`success ${saved}`} />
    </div>
  );
});

GridDataCellInput.displayName = 'GridDataCellInput';

export default withClickEventListener(GridDataCellInput);
