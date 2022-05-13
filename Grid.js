import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';

import GridRow from './GridRow';
import gridService from '../../../services/grid';
import LoadingView from '../../common/loadingView';

const _handleScrollEvent = (ref, fetchMore) => {
  const mainContentBlock = ref.current;

  mainContentBlock.addEventListener('scroll', () => {
    if (Math.ceil(mainContentBlock.scrollTop) + mainContentBlock.clientHeight >= mainContentBlock.scrollHeight) {
      fetchMore();
    }
  });
};

const Grid = props => {
  const mainRef = useRef(null);
  const innerRef = useRef(null);
  const headerRef = useRef(null);
  const {
    data,
    gridType,
    isLoading,
    isLazyLoading,
    fetchMore,
    updateRow,
    dashboardMode,
    reloadData,
    hasWriteAccess,
  } = props;

  useEffect(() => {
    _handleScrollEvent(innerRef, fetchMore);
  }, []);

  const minGridWidth = gridService.getMinWidth(gridType);

  return (
    <>
      <div className="grid grid-wrapper" ref={mainRef} style={{ minWidth: `${minGridWidth}px` }}>
        <div ref={headerRef}>
          <GridRow
            gridType={gridType}
            rowClass={`grid-row row-head ${gridType.hasRowSelection ? 'pl-26' : ''}`}
            reloadData={reloadData}
            minGridWidth={minGridWidth}
            isLazyLoading={isLazyLoading}
          />
        </div>
        <div className="grid-body" ref={innerRef}>
          {isLoading ? (
            <div className="loader-wrapper">
              <LoadingView />
            </div>
          ) : (
            data.items &&
            data.items.map((item, index) => (
              <GridRow
                gridType={gridType}
                minGridWidth={minGridWidth}
                updateRow={updateRow}
                key={index}
                innerRef={innerRef}
                data={item}
                rowId={index}
                hasWriteAccess={hasWriteAccess}
                rowClass="grid-row row-data"
                dashboardMode={dashboardMode}
                reloadData={reloadData}
              />
            ))
          )}
          {isLazyLoading && (
            <div className="loader-wrapper lazy">
              <LoadingView />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

Grid.defaultProps = {
  isLoading: false,
};

Grid.propTypes = {
  data: PropTypes.object.isRequired,
  gridType: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isLazyLoading: PropTypes.bool.isRequired,
  reloadData: PropTypes.func.isRequired,
  dashboardMode: PropTypes.string.isRequired,
  fetchMore: PropTypes.func.isRequired,
  updateRow: PropTypes.func,
  hasWriteAccess: PropTypes.bool,
};

export default Grid;
