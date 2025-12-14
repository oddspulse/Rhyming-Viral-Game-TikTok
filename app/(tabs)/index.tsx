import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { ChallengeCard } from '@/components/ChallengeCard';
import { Button } from '@/components/Button';
import { haptics } from '@/lib/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Challenge {
  id: string;
  title: string;
  phrase: string;
  difficulty: number;
  bpm: number;
  play_count: number;
  avg_score: number | null;
  is_daily: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const [dailyChallenge, setDailyChallenge] = useState<Challenge | null>(null);
  const [trendingChallenges, setTrendingChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChallenges = async () => {
    try {
      // Fetch daily challenge
      const { data: daily } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_daily', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (daily) setDailyChallenge(daily);

      // Fetch trending challenges
      const { data: trending } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_public', true)
        .eq('is_daily', false)
        .order('play_count', { ascending: false })
        .limit(10);

      if (trending) setTrendingChallenges(trending);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    haptics.light();
    loadChallenges();
  };

  const navigateToChallenge = (id: string) => {
    haptics.medium();
    router.push(`/challenge/${id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF1CF7"
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="mt-6 mb-8">
          <LinearGradient
            colors={['#FF1CF7', '#BC13FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-3xl p-6"
          >
            <Text className="text-white text-5xl font-black mb-2">Speed Rhyme</Text>
            <Text className="text-white/80 text-base">Talk fast. Score high. Go viral.</Text>
          </LinearGradient>
        </Animated.View>

        {/* Daily Challenge */}
        {dailyChallenge && (
          <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-2xl font-black">🔥 Today's Challenge</Text>
              <View className="bg-neon-pink/20 px-3 py-1 rounded-full">
                <Text className="text-neon-pink text-xs font-bold">24H LEFT</Text>
              </View>
            </View>
            <ChallengeCard
              {...dailyChallenge}
              onPress={() => navigateToChallenge(dailyChallenge.id)}
            />
          </Animated.View>
        )}

        {/* Trending Challenges */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-2xl font-black">⚡ Trending</Text>
            <Text className="text-gray-500 text-sm">{trendingChallenges.length} challenges</Text>
          </View>

          {loading ? (
            <View className="py-20">
              <Text className="text-gray-500 text-center">Loading challenges...</Text>
            </View>
          ) : trendingChallenges.length === 0 ? (
            <View className="bg-dark-card rounded-3xl p-8 items-center">
              <Text className="text-gray-500 text-center mb-4">
                No challenges yet. Be the first to create one!
              </Text>
              <Button onPress={() => router.push('/create')} variant="neon">
                Create Challenge
              </Button>
            </View>
          ) : (
            trendingChallenges.map((challenge, index) => (
              <Animated.View
                key={challenge.id}
                entering={FadeInDown.delay(400 + index * 50).springify()}
              >
                <ChallengeCard
                  {...challenge}
                  onPress={() => navigateToChallenge(challenge.id)}
                />
              </Animated.View>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
