import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { IconButton } from '@/components/Button';
import { LeaderboardRow } from '@/components/LeaderboardComponents';
import { haptics } from '@/lib/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number;
  created_at: string;
  profiles: {
    username: string | null;
  } | null;
}

interface Challenge {
  id: string;
  title: string;
}

export default function LeaderboardScreen() {
  const { challengeId } = useLocalSearchParams();
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
    getCurrentUser();
  }, [challengeId]);

  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setCurrentUserId(data.user.id);
    }
  };

  const loadLeaderboard = async () => {
    try {
      // Load challenge
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('id, title')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;
      setChallenge(challengeData);

      // Load top scores with user info
      const { data: scores, error: scoresError } = await supabase
        .from('attempts')
        .select(`
          id,
          user_id,
          score,
          created_at,
          profiles (
            username
          )
        `)
        .eq('challenge_id', challengeId)
        .order('score', { ascending: false })
        .limit(50);

      if (scoresError) throw scoresError;

      // Deduplicate - keep only best score per user
      const userBestScores = new Map<string, LeaderboardEntry>();
      scores?.forEach((score) => {
        const existing = userBestScores.get(score.user_id);
        if (!existing || score.score > existing.score) {
          userBestScores.set(score.user_id, score as LeaderboardEntry);
        }
      });

      const topScores = Array.from(userBestScores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);

      setLeaderboard(topScores);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    haptics.light();
    loadLeaderboard();
  };

  if (!challenge) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <Text className="text-gray-500">Loading leaderboard...</Text>
      </SafeAreaView>
    );
  }

  const currentUserRank = leaderboard.findIndex((entry) => entry.user_id === currentUserId);
  const currentUserEntry = currentUserRank >= 0 ? leaderboard[currentUserRank] : null;

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={['top']}>
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between mb-4">
        <IconButton
          onPress={() => router.back()}
          icon={<Ionicons name="arrow-back" size={24} color="white" />}
        />

        <Text className="text-white text-xl font-black">Leaderboard</Text>

        <View style={{ width: 48 }} />
      </View>

      {/* Challenge Title */}
      <Animated.View entering={FadeInDown.delay(100).springify()} className="px-5 mb-6">
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl p-4"
        >
          <Text className="text-dark text-2xl font-black">{challenge.title}</Text>
          <Text className="text-dark/70 text-sm font-semibold">
            {leaderboard.length} players ranked
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Current User Highlight */}
      {currentUserEntry && (
        <Animated.View entering={FadeInDown.delay(200).springify()} className="px-5 mb-4">
          <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Your Position</Text>
          <LeaderboardRow
            rank={currentUserRank + 1}
            username={currentUserEntry.profiles?.username || 'You'}
            score={currentUserEntry.score}
            isCurrentUser
          />
        </Animated.View>
      )}

      {/* Leaderboard List */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-8"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF1CF7"
          />
        }
      >
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text className="text-gray-400 text-xs font-bold uppercase mb-3">Top Players</Text>

          {loading ? (
            <View className="py-12">
              <Text className="text-gray-500 text-center">Loading rankings...</Text>
            </View>
          ) : leaderboard.length === 0 ? (
            <View className="bg-dark-card rounded-2xl p-8 items-center">
              <Text className="text-gray-500 text-center">
                No scores yet. Be the first to play!
              </Text>
            </View>
          ) : (
            leaderboard.map((entry, index) => (
              <LeaderboardRow
                key={entry.id}
                rank={index + 1}
                username={entry.profiles?.username || `Player ${index + 1}`}
                score={entry.score}
                isCurrentUser={entry.user_id === currentUserId}
                index={index}
              />
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
