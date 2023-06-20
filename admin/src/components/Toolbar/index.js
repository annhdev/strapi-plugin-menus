import React from 'react';
import PropTypes from 'prop-types';

import {stopPropagation} from '@strapi/helper-plugin';
import {IconButton} from '@strapi/design-system/IconButton';

import {StyledIconButtonGroup} from './styled';

const Toolbar = ({actions}) => {
  const visibleActions = actions.filter(({hidden}) => !hidden);

  return (
    <StyledIconButtonGroup {...stopPropagation}>
      {visibleActions.map(({icon, label, onClick, type, onDragStart}, i) => (
        (type !== "draggable" ?
            <IconButton
              key={i}
              onClick={onClick}
              label={label}
              icon={icon}
              noBorder
            />
            :
            <IconButton
              key={i}
              draggable
              onDragStart={onDragStart}
              icon={icon}
              noBorder
            />
        )
      ))}
    </StyledIconButtonGroup>
  );
};

Toolbar.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      hidden: PropTypes.bool,
      icon: PropTypes.node.isRequired,
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      onDragStart: PropTypes.func,
    }),
  ).isRequired,
};

export default Toolbar;
