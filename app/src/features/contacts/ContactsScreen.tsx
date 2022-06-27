import { useCallback, useEffect, useMemo, useState } from 'react';
import { Appbar, Title } from 'react-native-paper';
import { Address } from 'lib';
import { ethers } from 'ethers';
import FuzzySearch from 'fuzzy-search';
import { Box } from '@components/Box';
import { RootNavigatorScreenProps } from '@features/navigation/RootNavigator';
import { Contact, useContacts } from '~/queries/useContacts';
import { ContactItem } from './ContactItem';
import { CreateContactButton } from './CreateContactButton';
import { SelectAddressButton } from './SelectAddressButton';
import { FlatList } from 'react-native';
import { Actions } from '@components/Actions';
import { ActionsSpaceFooter } from '@components/ActionsSpaceFooter';
import { NavTarget, navToTarget } from '@features/navigation/target';
import { AppbarBack } from '@components/AppbarBack';
import { AppbarRoot } from '@components/AppbarRoot';
import { BasicTextField } from '@components/fields/BasicTextField';
import { ErrorText } from '@components/ErrorText';

const CONTACT_SEARCH_FIELDS: (keyof Contact)[] = ['name', 'addr'];

export interface ContactsScreenParams {
  target: NavTarget;
  disabledAddrs?: Address[];

  // Callbacks
  scanned?: Address;
}

export type ContactsScreenProps = RootNavigatorScreenProps<'Contacts'>;

export const ContactsScreen = ({
  navigation,
  route: { params },
}: ContactsScreenProps) => {
  const { disabledAddrs, scanned, target } = params;
  const { contacts: allContacts } = useContacts();

  const [search, setSearch] = useState('');
  const [error, setError] = useState(false);

  const select = useCallback(
    (addr: Address) => {
      if (ethers.utils.isAddress(addr)) {
        navToTarget(navigation, target, addr);
      } else {
        setError(true);
      }
    },
    [navigation, setError, target],
  );

  useEffect(() => {
    if (scanned) select(scanned);
  }, [scanned, select]);

  const contacts = useMemo(() => {
    const sorted = allContacts.sort((a, b) => a.name.localeCompare(b.name));

    const searcher = new FuzzySearch(sorted, CONTACT_SEARCH_FIELDS, {
      caseSensitive: false,
    });

    return searcher.search(search);
  }, [allContacts, search]);

  return (
    <>
      <FlatList
        ListHeaderComponent={
          <Box>
            <AppbarRoot>
              <AppbarBack />

              <Box vertical flex={1}>
                <BasicTextField
                  value={search}
                  onChangeText={(value) => {
                    setError(false);
                    setSearch(value);
                  }}
                  placeholder="Search by name or address"
                  style={{ fontSize: 16 }}
                />
              </Box>

              <Appbar.Action
                icon="line-scan"
                onPress={() =>
                  navigation.navigate('QrScanner', {
                    target: { route: 'Contacts', output: 'scanned' },
                  })
                }
              />
            </AppbarRoot>

            {!error ? (
              <SelectAddressButton
                input={search}
                select={select}
                mx={3}
                my={2}
              />
            ) : (
              <Box center mt={2}>
                <ErrorText error="Invalid address!" as={Title} />
              </Box>
            )}
          </Box>
        }
        stickyHeaderIndices={[0]}
        data={contacts}
        renderItem={({ item: contact }) => (
          <ContactItem
            contact={contact}
            select={select}
            disabled={disabledAddrs?.includes(contact.addr)}
            px={3}
            py={2}
          />
        )}
        keyExtractor={(contact) => contact.addr}
        ListFooterComponent={<ActionsSpaceFooter />}
      />

      <Actions>
        <CreateContactButton input={search} />
      </Actions>
    </>
  );
};
