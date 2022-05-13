import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import React, { useEffect, useRef } from 'react';

import { svgIcon } from '../../../constants';
import { SvgIcon } from '../../../assets/svgIcon';
import domElementUtil from '../../../utils/docElement';
import { dealerDetailsMenuOptions } from '../constants/options';
import { withClickEventListener } from '../../../hoc/withClickEventListener';

const VERTICAL_OFFSET = -5;

const GridMeatBallMenu = React.forwardRef((props, ref) => {
  const { selected, data, innerRef, column } = props;

  const menuRef = useRef();
  const history = useHistory();

  const additionalClassNames = classNames({
    selected,
  });

  useEffect(() => {
    selected && domElementUtil.manageChildToParentPos(menuRef, innerRef, VERTICAL_OFFSET);
  }, [selected]);

  return (
    <div className={`${additionalClassNames} meat-ball-menu-wrapper`} ref={ref}>
      <SvgIcon name={svgIcon.MEAT_BALL_MENU} />
      {selected && (
        <ul className="menu" ref={menuRef}>
          {dealerDetailsMenuOptions.map(item => (
            <li key={item.value} onClick={_handleClick(item.value, history, data[column.dataColumn])}>
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

const _handleClick = (route, history, id) => e => {
  e.preventDefault();

  history.push(route.replace(':id', id));
};

export default withClickEventListener(GridMeatBallMenu);
