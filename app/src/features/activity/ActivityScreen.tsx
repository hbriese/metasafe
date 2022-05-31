import { Box } from '@components/Box';
import { Timestamp } from '@components/Timestamp';
import { TabNavigatorScreenProps } from '@features/navigation/TabNavigator';
import { Transfer, useTransfers } from '@gql/queries/useTransfers';
import { groupBy } from 'lib';
import { useMemo } from 'react';
import { SectionList } from 'react-native';
import { Subheading } from 'react-native-paper';
import { TransferItem } from './TransferItem';

interface Section {
  timestamp: number;
  data: Transfer[];
}

export type ActivityScreenProps = TabNavigatorScreenProps<'Activity'>;

export const ActivityScreen = (_props: ActivityScreenProps) => {
  const { transfers } = useTransfers();

  const sections: Section[] = useMemo(
    () =>
      [
        ...groupBy(transfers, (t) =>
          t.timestamp
            .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
            .toSeconds(),
        ).entries(),
      ]
        .map(
          ([timestamp, transfers]): Section => ({
            timestamp,
            data: transfers.sort(
              (a, b) => b.timestamp.toMillis() - a.timestamp.toMillis(),
            ),
          }),
        )
        .sort((a, b) => b.timestamp - a.timestamp),
    [transfers],
  );

  return (
    <Box flex={1}>
      <SectionList
        sections={sections}
        keyExtractor={(t) => t.id}
        renderSectionHeader={({ section: { timestamp } }) => (
          <Box mx={3} mt={2} mb={1}>
            <Subheading>
              <Timestamp>{timestamp}</Timestamp>
            </Subheading>
          </Box>
        )}
        renderItem={({ item }) => (
          <TransferItem transfer={item} px={3} py={2} />
        )}
      />
    </Box>
  );
};
