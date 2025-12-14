import React from 'react';
import { View, Text } from 'react-native';
import { getBadgeInfo } from '@/lib/scoring';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

interface BadgeProps {
  badge: string;
  index?: number;
}

export function Badge({ badge, index = 0 }: BadgeProps) {
  const info = getBadgeInfo(badge);

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).springify()}
      className="bg-dark-card rounded-2xl px-4 py-3 border border-dark-border mr-3 mb-3"
    >
      <View className="flex-row items-center gap-2">
        <Text className="text-2xl">{info.emoji}</Text>
        <View>
          <Text className="text-xs text-gray-500 uppercase font-semibold">BADGE</Text>
          <Text className="text-white text-sm font-bold">{info.label}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

interface LeaderboardRowProps {
  rank: number;
  username: string;
  score: number;
  isCurrentUser?: boolean;
  index?: number;
}

export function LeaderboardRow({
  rank,
  username,
  score,
  isCurrentUser = false,
  index = 0,
}: LeaderboardRowProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#00F0FF';
  };

  const rankColor = getRankColor(rank);

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 50).springify()}
      className={`flex-row items-center justify-between py-4 px-5 mb-2 rounded-2xl ${
        isCurrentUser ? 'bg-neon-purple/20 border-2 border-neon-purple' : 'bg-dark-card'
      }`}
    >
      <View className="flex-row items-center gap-4 flex-1">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: rankColor + '30' }}
        >
          <Text className="text-lg font-black" style={{ color: rankColor }}>
            {rank}
          </Text>
        </View>

        <View className="flex-1">
          <Text className={`text-base font-bold ${isCurrentUser ? 'text-neon-purple' : 'text-white'}`}>
            {isCurrentUser ? 'YOU' : username || 'Anonymous'}
          </Text>
          {isCurrentUser && (
            <Text className="text-xs text-neon-purple/70">Your ranking</Text>
          )}
        </View>
      </View>

      <View className="items-end">
        <Text className="text-2xl font-black text-neon-green">{score}</Text>
        <Text className="text-xs text-gray-500">SCORE</Text>
      </View>
    </Animated.View>
  );
}
