import { STYLES } from '@util/styles';
import { TouchableOpacity } from 'react-native';
import { Subheading } from 'react-native-paper';

export interface ExecuteButtonProps {
  onPress: () => void;
  color: string;
  children: string;
}

export const TimelineButton = ({
  onPress,
  color,
  children,
}: ExecuteButtonProps) => (
  <TouchableOpacity onPress={onPress}>
    <Subheading
      style={{
        color,
        fontWeight: 'bold',
        marginVertical: 0,
        ...STYLES.dropShadow,
      }}
    >
      {children.toUpperCase()}
    </Subheading>
  </TouchableOpacity>
);
