import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { getScoreColor } from '@/lib/scoring';

interface ScoreDisplayProps {
  score: number;
  animate?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function ScoreDisplay({ score, animate = false, size = 'medium', showLabel = true }: ScoreDisplayProps) {
  const displayScore = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-5xl',
    large: 'text-7xl',
  };

  const labelSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  useEffect(() => {
    if (animate) {
      // Delay before animation starts
      setTimeout(() => {
        // Count up animation
        displayScore.value = withTiming(score, {
          duration: 1500,
          easing: Easing.out(Easing.cubic),
        });

        // Scale and fade in
        scale.value = withSequence(
          withSpring(1.2, { damping: 10 }),
          withSpring(1, { damping: 15 })
        );

        opacity.value = withTiming(1, { duration: 300 });
      }, 1000);
    } else {
      displayScore.value = score;
      scale.value = 1;
      opacity.value = 1;
    }
  }, [score, animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => {
    const currentScore = Math.round(displayScore.value);
    return {
      color: getScoreColor(currentScore),
    };
  });

  return (
    <Animated.View style={animatedStyle} className="items-center">
      <Animated.Text
        style={animatedTextStyle}
        className={`${sizeClasses[size]} font-black`}
      >
        {Math.round(displayScore.value)}
      </Animated.Text>
      {showLabel && (
        <Text className={`${labelSizeClasses[size]} text-gray-400 font-bold mt-1`}>
          SCORE
        </Text>
      )}
    </Animated.View>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}

export function StatCard({ label, value, icon, color = '#00F0FF' }: StatCardProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle} className="bg-dark-card rounded-2xl p-4 flex-1 border border-dark-border">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-gray-400 text-xs font-semibold uppercase">{label}</Text>
        {icon && <Text className="text-xl">{icon}</Text>}
      </View>
      <Text className="text-3xl font-black" style={{ color }}>
        {value}
      </Text>
    </Animated.View>
  );
}
