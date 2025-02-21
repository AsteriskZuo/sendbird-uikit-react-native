/**
 * Usage
 * {@link https://sendbird.com/docs/uikit/v3/react-native/key-functions/list-channels#2-usage}
 * */
import React from 'react';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { MessageSearchProps, createMessageSearchFragment, useSendbirdChat } from '@sendbird/uikit-react-native';

const MessageSearchFragment = createMessageSearchFragment();
const MessageSearchScreen = ({ route: { params } }: any) => {
  const { sdk } = useSendbirdChat();

  const { channel } = useGroupChannel(sdk, params.channelUrl);
  if (!channel) return null;

  const navigateToBack = () => {};
  const navigateToGroupChannelWithSearchItem: MessageSearchProps['Fragment']['onPressSearchResultItem'] = ({
    message,
  }) => {
    // You must pass `searchItem` to `GroupChannelFragment`
    const searchItem = { startingPoint: message.createdAt };

    // <GroupChannelFragment searchItem={searchItem} />
  };

  return (
    <MessageSearchFragment
      channel={channel}
      onPressHeaderLeft={navigateToBack}
      onPressSearchResultItem={navigateToGroupChannelWithSearchItem}
    />
  );
};
/** ------------------ **/
