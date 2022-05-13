import { svgIcon, tableConstants } from '../../../constants';

const mockTableConfig = {
  minWidth: 1500,
  columnConfig: [
    {
      title: 'Column 1',
      dataColumn: 'col_1',
      format: tableConstants.dataFormat.CAPITALIZE,
      width: 20,
      prefixIcon: svgIcon.CALL,
    },
    {
      title: 'Column 2',
      dataColumn: 'col_2',
      format: tableConstants.dataFormat.TITLE_CASE,
      width: 10,
      copyable: true,
    },
    {
      title: 'Column 3',
      dataColumn: 'col_3',
      format: tableConstants.dataFormat.LOWERCASE,
      width: 7,
      suffixIcon: svgIcon.MAGNIFYING_GLASS,
    },
    {
      title: 'Column 4',
      dataColumn: 'col_4',
      format: tableConstants.dataFormat.UPPERCASE,
      width: 11,
    },
    {
      title: 'Column 5',
      dataColumn: 'col_5',
      format: tableConstants.dataFormat.CAPITALIZE,
      width: 15,
    },
    {
      title: 'Column 6',
      dataColumn: 'col_6',
      format: tableConstants.dataFormat.TITLE_CASE,
      width: 20,
    },
    {
      title: 'Column 7',
      dataColumn: 'col_7',
      format: tableConstants.dataFormat.LOWERCASE,
      width: 20,
    },
    {
      title: 'Column 8',
      dataColumn: 'col_8',
      format: tableConstants.dataFormat.UPPERCASE,
      width: 10,
    },
  ],
};

const getMockData = (offset = 1, limit = 25, isError = false) => {
  const getDataObject = id => ({
    id,
    col_1: `row ${id} col 1`,
    col_2: `row ${id} col 2 is with heavy data for checking ...`,
    col_3: `row ${id} col 3`,
    col_4: `row ${id} col 4`,
  });
  const nextOffset = offset + limit;
  const generateData = () => Array.from(Array(limit).keys()).map(() => getDataObject(offset++));

  return new Promise(resolve => {
    const data = {
      items: generateData(),
      offset: nextOffset,
    };

    const timeout = setTimeout(() => {
      resolve(isError ? { error: 'error' } : data);
      clearTimeout(timeout);
    }, 2000);
  });
};

export { getMockData, mockTableConfig };
