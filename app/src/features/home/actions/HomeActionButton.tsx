import { ComponentPropsWithoutRef, FC } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { Box } from '@components/Box';
import { MaterialIcons } from '@expo/vector-icons';

type IconProps = Pick<
  ComponentPropsWithoutRef<typeof MaterialIcons>,
  'size' | 'color'
>;

export interface HomeActionButtonProps {
  label: string;
  icon: FC<IconProps>;
  onClick: () => void;
}

export const HomeActionButton = ({
  icon: Icon,
  label,
  onClick,
}: HomeActionButtonProps) => {
  const { colors } = useTheme();

  return (
    <Box mx={2}>
      <TouchableOpacity onPress={onClick}>
        <Box vertical center>
          <Icon size={30} color={colors.primary} />

          <Box mt={2}>
            <Text style={{ color: colors.primary }}>{label}</Text>
          </Box>
        </Box>
      </TouchableOpacity>
    </Box>
  );
};
