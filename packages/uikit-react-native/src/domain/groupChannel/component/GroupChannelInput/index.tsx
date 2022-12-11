import React, { MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createStyleSheet, useUIKitTheme } from '@sendbird/uikit-react-native-foundation';
import {
  SendbirdFileMessage,
  SendbirdGroupChannel,
  SendbirdUserMessage,
  getGroupChannelChatAvailableState,
  replace,
  useIIFE,
} from '@sendbird/uikit-utils';

import { useSendbirdChat } from '../../../../hooks/useContext';
import useMentionTextInput from '../../../../hooks/useMentionTextInput';
import { GroupChannelContexts } from '../../module/moduleContext';
import type { GroupChannelProps } from '../../types';
import EditInput from './EditInput';
import SendInput from './SendInput';

const AUTO_FOCUS = Platform.select({ ios: false, android: true, default: false });
const KEYBOARD_AVOID_VIEW_BEHAVIOR = Platform.select({ ios: 'padding' as const, default: undefined });

// TODO: Refactor 'Edit' mode to clearly
const GroupChannelInput = (props: GroupChannelProps['Input']) => {
  const { top, left, right, bottom } = useSafeAreaInsets();
  const { colors } = useUIKitTheme();
  const { features, mentionManager } = useSendbirdChat();
  const { channel, editMessage, setEditMessage, keyboardAvoidOffset = 0 } = useContext(GroupChannelContexts.Fragment);

  const chatAvailableState = getGroupChannelChatAvailableState(channel);
  const mentionAvailable = features.mentionEnabled && channel.isGroupChannel() && !channel.isBroadcast;
  const inputMode = useIIFE(() => {
    if (!editMessage) return 'send';
    if (editMessage.isFileMessage()) return 'send';
    return 'edit';
  });

  const [inputHeight, setInputHeight] = useState(styles.inputDefault.height);

  const { selection, setSelection, onSelectionChange, textInputRef, text, onChangeText, mentionedUsers } =
    useMentionTextInput({ editMessage });

  useTypingTrigger(text, channel);
  useTextPersistenceOnDisabled(text, onChangeText, chatAvailableState.disabled);
  useAutoFocusOnEditMode(textInputRef, editMessage);

  const onPressToMention: GroupChannelProps['MentionSuggestionList']['onPressToMention'] = (
    user,
    searchStringRange,
  ) => {
    const mentionedMessageText = mentionManager.asMentionedMessageText(user, true);
    const range = { start: searchStringRange.start, end: searchStringRange.start + mentionedMessageText.length - 1 };

    onChangeText(replace(text, searchStringRange.start, searchStringRange.end, mentionedMessageText), { user, range });
  };

  if (!props.shouldRenderInput) {
    return <SafeAreaBottom height={bottom} />;
  }

  return (
    <>
      <KeyboardAvoidingView
        keyboardVerticalOffset={-bottom + keyboardAvoidOffset}
        behavior={KEYBOARD_AVOID_VIEW_BEHAVIOR}
      >
        <View style={{ paddingLeft: left, paddingRight: right, backgroundColor: colors.background }}>
          {mentionAvailable && Platform.OS !== 'android' && (
            // NOTE: Android cannot recognize the scroll responder properly
            //  when has absolute ScrollView inside KeyboardAvoidingView
            <props.MentionSuggestionList
              text={text}
              selection={selection}
              inputHeight={inputHeight}
              topInset={top}
              bottomInset={bottom}
              onPressToMention={onPressToMention}
              mentionedUsers={mentionedUsers}
            />
          )}
          <View onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)} style={styles.inputContainer}>
            {inputMode === 'send' && (
              <SendInput
                {...props}
                {...chatAvailableState}
                ref={textInputRef as never}
                text={text}
                onChangeText={onChangeText}
                setSelection={setSelection}
                onSelectionChange={onSelectionChange}
                mentionedUsers={mentionedUsers}
              />
            )}
            {inputMode === 'edit' && editMessage && (
              <EditInput
                {...props}
                ref={textInputRef as never}
                autoFocus={AUTO_FOCUS}
                text={text}
                onChangeText={onChangeText}
                editMessage={editMessage}
                setEditMessage={setEditMessage}
                disabled={chatAvailableState.disabled}
                onSelectionChange={onSelectionChange}
                mentionedUsers={mentionedUsers}
              />
            )}
          </View>
          <SafeAreaBottom height={bottom} />
        </View>
      </KeyboardAvoidingView>
      {mentionAvailable && Platform.OS === 'android' && (
        <props.MentionSuggestionList
          text={text}
          selection={selection}
          inputHeight={inputHeight}
          topInset={top}
          bottomInset={bottom}
          onPressToMention={onPressToMention}
          mentionedUsers={mentionedUsers}
        />
      )}
    </>
  );
};

const useTypingTrigger = (text: string, channel: SendbirdGroupChannel) => {
  useEffect(() => {
    if (text.length === 0) channel.endTyping();
    else channel.startTyping();
  }, [text]);
};

const useTextPersistenceOnDisabled = (text: string, setText: (val: string) => void, chatDisabled: boolean) => {
  const textTmpRef = useRef('');

  useEffect(() => {
    if (chatDisabled) {
      textTmpRef.current = text;
      setText('');
    } else {
      setText(textTmpRef.current);
    }
  }, [chatDisabled]);
};

const useAutoFocusOnEditMode = (
  textInputRef: MutableRefObject<TextInput | undefined>,
  editMessage?: SendbirdUserMessage | SendbirdFileMessage,
) => {
  useEffect(() => {
    if (editMessage?.isUserMessage()) {
      if (!AUTO_FOCUS) setTimeout(() => textInputRef.current?.focus(), 500);
    }
  }, [editMessage]);
};

const SafeAreaBottom = ({ height }: { height: number }) => {
  return <View style={{ height }} />;
};

const styles = createStyleSheet({
  inputContainer: {
    justifyContent: 'center',
    width: '100%',
  },
  inputDefault: {
    height: 56,
  },
});

export default React.memo(GroupChannelInput);
