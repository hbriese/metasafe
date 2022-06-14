import { useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { Sheet } from './sheet/Sheet';
import { Timeline } from './timeline/Timeline';
import { Activity, ActivityItem } from '@features/activity/ActivityItem';
import { isTx } from '~/queries/tx/useTxs';
import { TxDetails } from './details/TxDetails';

export interface ActivitySheetProps {
  activity: Activity;
  onClose: () => void;
}

export const ActivitySheet = ({ activity, onClose }: ActivitySheetProps) => {
  const sheetRef = useRef<BottomSheet>(null);

  return (
    <Sheet
      ref={sheetRef}
      initialSnapPoints={[]}
      onClose={onClose}
      enablePanDownToClose
    >
      <ActivityItem
        activity={activity}
        px={3}
        py={2}
        txProps={{
          status: false,
          dividers: false,
        }}
      />

      {isTx(activity) && <Timeline tx={activity} />}

      {isTx(activity) && <TxDetails tx={activity} />}
    </Sheet>
  );
};