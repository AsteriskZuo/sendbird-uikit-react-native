import React from 'react';

import type { SendbirdUserMessage } from '@sendbird/uikit-utils';

import Box from '../../components/Box';
import ImageWithPlaceholder from '../../components/ImageWithPlaceholder';
import PressBox from '../../components/PressBox';
import Text from '../../components/Text';
import createStyleSheet from '../../styles/createStyleSheet';
import useUIKitTheme from '../../theme/useUIKitTheme';

const MessageOpenGraph = ({
  onPressURL,
  onLongPress,
  ogMetaData,
  variant,
}: {
  ogMetaData: Required<SendbirdUserMessage>['ogMetaData'];
  variant: 'outgoing' | 'incoming';
  onPressURL?: () => void;
  onLongPress?: () => void;
}) => {
  const { palette, select, colors } = useUIKitTheme();
  const color = colors.ui.groupChannelMessage[variant];

  return (
    <PressBox activeOpacity={0.85} onPress={onPressURL} onLongPress={onLongPress}>
      {({ pressed }) => (
        <Box backgroundColor={pressed ? color.pressed.background : color.enabled.background}>
          {Boolean(ogMetaData.defaultImage) && (
            <ImageWithPlaceholder style={styles.ogImage} source={{ uri: ogMetaData.defaultImage.url }} />
          )}

          <Box
            style={styles.ogContainer}
            backgroundColor={select({ dark: palette.background400, light: palette.background100 })}
          >
            <Text numberOfLines={3} body2 color={colors.onBackground01} style={styles.ogTitle}>
              {ogMetaData.title}
            </Text>
            {Boolean(ogMetaData.description) && (
              <Text numberOfLines={1} caption2 color={colors.onBackground01} style={styles.ogDesc}>
                {ogMetaData.description}
              </Text>
            )}
            <Text numberOfLines={1} caption2 color={colors.onBackground02}>
              {ogMetaData.url}
            </Text>
          </Box>
        </Box>
      )}
    </PressBox>
  );
};

const styles = createStyleSheet({
  ogContainer: {
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  ogImage: {
    width: '100%',
    height: 136,
  },
  ogUrl: {
    marginBottom: 4,
  },
  ogTitle: {
    marginBottom: 4,
  },
  ogDesc: {
    lineHeight: 14,
    marginBottom: 8,
  },
});

export default MessageOpenGraph;
