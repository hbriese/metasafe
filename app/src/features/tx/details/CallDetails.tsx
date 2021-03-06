import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { ExpandableText } from '@components/ExpandableText';
import { TokenValue } from '@components/token/TokenValue';
import { hexlify } from 'ethers/lib/utils';
import { Call } from 'lib';
import { Paragraph, Subheading } from 'react-native-paper';
import { ETH } from '~/token/tokens';
import { useMaybeToken } from '~/token/useToken';
import { DecodedOpDetails } from './DecodedCallDetails';
import { CallDetailsRow } from './CallDetailsRow';

export interface CallDetailsProps {
  call: Call;
  title?: string;
}

export const CallDetails = ({ call, title }: CallDetailsProps) => {
  const token = useMaybeToken(call.to) ?? ETH;

  return (
    <Box vertical>
      {title && <Subheading style={{ fontWeight: 'bold' }}>{title}</Subheading>}

      <CallDetailsRow
        title="to"
        content={
          <Paragraph>
            <Addr addr={call.to} />
          </Paragraph>
        }
      />

      {call.value.gt(0) && (
        <CallDetailsRow
          title="value"
          content={
            <Paragraph>
              <TokenValue token={token} value={call.value} />
            </Paragraph>
          }
        />
      )}

      {call.data !== '0x' && (
        <CallDetailsRow
          title="data"
          content={
            <ExpandableText text={hexlify(call.data)} beginLen={8} endLen={8}>
              {({ text }) => <Paragraph>{text}</Paragraph>}
            </ExpandableText>
          }
        />
      )}

      <DecodedOpDetails call={call} />
    </Box>
  );
};
