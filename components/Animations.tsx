import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

interface PulseRingProps {
  size: number;
  color: string;
  isActive: boolean;
  bpm?: number;
}

export function PulseRing({ size, color, isActive, bpm = 100 }: PulseRingProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    if (isActive) {
      const duration = (60 / bpm) * 1000; // Convert BPM to milliseconds

      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite
        false
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: duration / 2 }),
          withTiming(0.8, { duration: duration / 2 })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(0.8, { duration: 300 });
    }
  }, [isActive, bpm]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 4,
          borderColor: color,
        },
      ]}
    />
  );
}

interface RecordButtonProps {
  size: number;
  isRecording: boolean;
  onPress?: () => void;
}

export function RecordButton({ size, isRecording }: RecordButtonProps) {
  const innerScale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      innerScale.value = withRepeat(
        withSequence(
          withTiming(0.9, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );

      rotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(innerScale);
      cancelAnimation(rotation);
      innerScale.value = withTiming(1, { duration: 300 });
      rotation.value = withTiming(0, { duration: 300 });
    }
  }, [isRecording]);

  const innerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: innerScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <View
      className="items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Animated.View
        style={[
          innerAnimatedStyle,
          {
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: size * 0.35,
            backgroundColor: isRecording ? '#FF1744' : '#FF1CF7',
          },
        ]}
        className="items-center justify-center"
      >
        {isRecording && (
          <View
            className="bg-white"
            style={{
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: 8,
            }}
          />
        )}
      </Animated.View>
    </View>
  );
}
