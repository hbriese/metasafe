import React, { ReactNode, useMemo } from 'react';
import { ChildrenProps, getNodeKey } from '@util/children';
import { Box, BoxProps } from '@components/Box';
import { Divider } from '@components/Divider';

export const FLAT_ITEMS_DEFAULT_SPACE = 3;

export interface FlatItemsContainerProps extends ChildrenProps, BoxProps {
  separator?: ReactNode | boolean;
  horizontal?: boolean;
}

export const Container = ({
  children: childrenNode,
  separator,
  horizontal,
  ...boxProps
}: FlatItemsContainerProps) => {
  const children = useMemo(
    () => React.Children.toArray(childrenNode).filter(Boolean),
    [childrenNode],
  );

  return (
    <Box horizontal={horizontal} {...boxProps}>
      {children.map((child, i) => (
        <Box key={getNodeKey(child, i)} horizontal={horizontal}>
          {child}

          {separator && i < children.length - 1 ? (
            typeof separator === 'boolean' ? (
              <Divider />
            ) : (
              separator
            )
          ) : null}
        </Box>
      ))}
    </Box>
  );
};