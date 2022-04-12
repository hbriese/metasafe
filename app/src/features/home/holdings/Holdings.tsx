import { useTheme } from 'react-native-paper';

import { TokenHolding } from './TokenHolding';
import { TOKENS } from '~/token/tokens';
import { Box } from '@components/Box';
import { Divider } from '@components/Divider';

const space = 3;

export const Holdings = () => {
  const { radius } = useTheme();

  return (
    <Box
      surface={{
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
      }}
    >
      {TOKENS.map((token, i) => (
        <Box key={token.symbol} mt={i > 0 ? space : 0}>
          <TokenHolding token={token} />

          {i < TOKENS.length - 1 && (
            <Box mt={space}>
              <Divider />
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};