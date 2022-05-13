import _sortBy from 'lodash.sortby';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import React, { useState, useEffect, useRef } from 'react';

import { optionKeys } from '../../../actions/options';
import { SUCCESS_TIMER } from '../../../constants/app';
import docElementUtils from '../../../utils/docElement';
import { withClickEventListener } from '../../../hoc/withClickEventListener';

const _getOptions = options => {
  return options[optionKeys.TITLES_STATUS].reduce((prevValue, currValue) => {
    return currValue.is_missing_title
      ? [...prevValue, { label: currValue.label, value: currValue.value }]
      : [...prevValue];
  }, []);
};

const GridDataCellDropdown = React.forwardRef((props, ref) => {
  const options = useSelector(state => state.options);
  const { data, column, updateRow, selected, setSelected, innerRef } = props;

  const defaultValue = { label: data[column.label], value: data[column.value] };
  const defaultPlaceHolder = data[column.label] || '';
  const defaultOptions = _sortBy(_getOptions(options, column.label, column.value), 'label');

  const [readOnly, setReadOnly] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || null);
  const [placeHolder, setPlaceHolder] = useState(defaultPlaceHolder);
  const [dropdownOptions, setDropDownOptions] = useState(defaultOptions);

  const inputRef = useRef();
  const menuRef = useRef();

  const customClassNames = classNames({
    selected,
    success: isSuccess,
    active: !readOnly,
  });

  const handleSelection = selectedValue => {
    setReadOnly(true);
    setMenuIsOpen(false);
    setValue(selectedValue);
    setPlaceHolder(selectedValue.label);
    setSelected(false);
    setDropDownOptions(defaultOptions);
    updateValue(selectedValue);
  };

  const updateValue = selectedValue => {
    updateRow(data, column, selectedValue).then(res => {
      if (res.error) {
        setValue(defaultValue);
        setPlaceHolder(defaultPlaceHolder);
      } else {
        setIsSuccess(true);
        const successTimer = setTimeout(() => {
          setIsSuccess(false);
          clearTimeout(successTimer);
        }, SUCCESS_TIMER);
      }
    });
  };

  const handleDoubleClick = () => {
    setReadOnly(false);
    inputRef.current.focus();
    inputRef.current.select();
  };

  const _handleInputChange = e => {
    setPlaceHolder(e.target.value);

    if (!readOnly && e.target.value.trim() !== '') {
      !menuIsOpen && setMenuIsOpen(true);
    }

    setDropDownOptions(
      defaultOptions.filter(item => item.label.toLowerCase().includes(e.target.value.trim().toLowerCase()))
    );
  };

  useEffect(() => {
    if (selected) {
      inputRef.current.addEventListener('dblclick', handleDoubleClick);
    } else {
      setReadOnly(true);
      setMenuIsOpen(false);

      if (placeHolder !== value.label) {
        setPlaceHolder(defaultPlaceHolder);
        setDropDownOptions(defaultOptions);
      }

      inputRef.current.removeEventListener('dblclick', handleDoubleClick);
    }

    return () => {
      inputRef.current.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [selected]);

  useEffect(() => {
    menuIsOpen && docElementUtils.manageChildToParentPos(menuRef, innerRef);
  }, [menuIsOpen]);

  return (
    <div className={`${customClassNames} dropdown-wrapper`} ref={ref}>
      <input
        type="text"
        value={placeHolder}
        readOnly={readOnly}
        className="dropdown-input"
        ref={inputRef}
        onChange={_handleInputChange}
      />
      <div
        className="dropdown-arrow-wrapper"
        onClick={() => {
          if (menuIsOpen) {
            if (!readOnly) {
              setPlaceHolder('');
              setReadOnly(true);
            } else {
              setMenuIsOpen(false);
            }
            setDropDownOptions(defaultOptions);
          } else {
            setMenuIsOpen(true);
          }
        }}>
        <div className="dropdown-arrow" />
      </div>
      {selected && menuIsOpen && dropdownOptions.length > 0 && (
        <div className={`options-wrapper`} ref={menuRef}>
          <ul>
            {dropdownOptions.map((item, index) => (
              <li
                className={placeHolder === item.label ? 'selected-option' : ''}
                key={index}
                onClick={() => {
                  handleSelection(item);
                }}>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

GridDataCellDropdown.displayName = 'GridDataCellDropdown';

export default withClickEventListener(GridDataCellDropdown);
