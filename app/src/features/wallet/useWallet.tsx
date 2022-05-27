import * as storage from 'expo-secure-store';
import * as zk from 'zksync-web3';

import { ETH_PROVIDER, PROVIDER } from '~/provider';
import { CONFIG, IS_DEV } from '~/config';
import { atom, useRecoilValue } from 'recoil';
import { getSecureStore, persistAtom } from '@util/persistAtom';

const defaultWallet = (() => {
  const wallet =
    IS_DEV && CONFIG.wallet.privateKey
      ? new zk.Wallet(CONFIG.wallet.privateKey)
      : zk.Wallet.createRandom();

  return wallet.connect(PROVIDER).connectToL1(ETH_PROVIDER);
})();

const walletState = atom<zk.Wallet>({
  key: 'wallet',
  default: defaultWallet,
  effects: [
    persistAtom({
      save: (wallet) => wallet.privateKey,
      load: (privateKey) => new zk.Wallet(privateKey, PROVIDER, ETH_PROVIDER),
      storage: getSecureStore({
        // requireAuthentication: true,   // Requires biometric authentication
        keychainAccessible: storage.WHEN_UNLOCKED, // iOS: PK is available on any unlocked synced device; consider using WHEN_UNLOCKED_THIS_DEVICE_ONLY
      }),
    }),
  ],
  dangerouslyAllowMutability: true, // Required due to provider internal mutations
});

export const useWallet = () => useRecoilValue(walletState);