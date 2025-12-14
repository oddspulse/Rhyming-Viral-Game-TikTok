import React from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { haptics } from '@/lib/haptics';
import { soundManager } from '@/lib/sounds';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'neon';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  hapticFeedback?: boolean;
  soundFeedback?: boolean;
  className?: string;
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  hapticFeedback = true,
  soundFeedback = true,
  className = '',
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    if (disabled || loading) return;

    if (hapticFeedback) haptics.medium();
    if (soundFeedback) soundManager.playTap();

    // Pulse animation
    scale.value = withSequence(
      withSpring(0.95, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );

    onPress();
  };

  const sizeClasses = {
    small: 'px-4 py-2',
    medium: 'px-6 py-3',
    large: 'px-8 py-4',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl',
  };

  const variantStyles = {
    primary: ['#BC13FE', '#FF1CF7'],
    secondary: ['#1f1f1f', '#2a2a2a'],
    danger: ['#FF1744', '#F50057'],
    neon: ['#00F0FF', '#BC13FE'],
  };

  const colors = variantStyles[variant];

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={animatedStyle}
      className={className}
    >
      <LinearGradient
        colors={disabled ? ['#444', '#333'] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={`rounded-2xl ${sizeClasses[size]} items-center justify-center`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className={`${textSizeClasses[size]} font-bold text-white text-center`}>
            {children}
          </Text>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

interface IconButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  size?: number;
  hapticFeedback?: boolean;
}

export function IconButton({ onPress, icon, size = 48, hapticFeedback = true }: IconButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (hapticFeedback) haptics.light();
    soundManager.playTap();

    scale.value = withSequence(
      withSpring(0.9, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );

    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[animatedStyle, { width: size, height: size }]}
      className="items-center justify-center bg-dark-card rounded-full"
    >
      {icon}
    </AnimatedPressable>
  );
}
