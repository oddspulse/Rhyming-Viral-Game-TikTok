import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { haptics } from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ChallengeCardProps {
  id: string;
  title: string;
  phrase: string;
  difficulty: number;
  bpm: number;
  playCount: number;
  avgScore?: number;
  isDaily?: boolean;
  onPress: () => void;
}

export function ChallengeCard({
  title,
  phrase,
  difficulty,
  bpm,
  playCount,
  avgScore,
  isDaily = false,
  onPress,
}: ChallengeCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    haptics.light();
    onPress();
  };

  const difficultyColor = {
    1: '#39FF14',
    2: '#FFFC00',
    3: '#FF8C00',
    4: '#FF1CF7',
    5: '#FF1744',
  }[difficulty] || '#FFFC00';

  const difficultyLabel = ['', 'EASY', 'MEDIUM', 'HARD', 'EXTREME', 'INSANE'][difficulty];

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className="mb-4"
    >
      <View className="bg-dark-card rounded-3xl p-5 border border-dark-border overflow-hidden">
        {isDaily && (
          <View className="absolute top-0 right-0">
            <LinearGradient
              colors={['#FF1CF7', '#BC13FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-4 py-1 rounded-bl-2xl"
            >
              <Text className="text-white text-xs font-bold">DAILY</Text>
            </LinearGradient>
          </View>
        )}

        <Text className="text-white text-2xl font-bold mb-2">{title}</Text>

        <Text className="text-gray-400 text-base mb-4 leading-6" numberOfLines={2}>
          "{phrase}"
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="bg-dark rounded-xl px-3 py-1.5">
              <Text className="text-white text-sm font-bold">⚡ {bpm} BPM</Text>
            </View>

            <View className="rounded-xl px-3 py-1.5" style={{ backgroundColor: difficultyColor + '20' }}>
              <Text className="text-sm font-bold" style={{ color: difficultyColor }}>
                {difficultyLabel}
              </Text>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-gray-500 text-xs">{playCount.toLocaleString()} plays</Text>
            {avgScore !== null && avgScore !== undefined && (
              <Text className="text-neon-blue text-sm font-bold">{avgScore.toFixed(0)}% avg</Text>
            )}
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}
