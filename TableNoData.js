import React from 'react';

import { SvgIcon } from '../../../assets/svgIcon';
import { svgIcon, tableConstants } from '../../../constants';
import { FlexContainer, flexDirection } from '../FlexContainer';

export const TableNoData = () => {
  const { noDataIconData, LABEL } = tableConstants.noDataConfigs;

  return (
    <FlexContainer direction={flexDirection.COL} classList="table-body-no-data">
      <SvgIcon
        name={svgIcon.NO_DATA}
        color={noDataIconData.COLOR}
        height={noDataIconData.height}
        width={noDataIconData.width}
      />
      <div>{LABEL}</div>
    </FlexContainer>
  );
};
