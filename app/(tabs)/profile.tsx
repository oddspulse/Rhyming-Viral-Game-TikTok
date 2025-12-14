import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/Button';
import { StatCard } from '@/components/ScoreDisplay';
import { Badge } from '@/components/LeaderboardComponents';
import { calculateBadges } from '@/lib/scoring';
import { haptics } from '@/lib/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Profile {
  id: string;
  username: string | null;
  best_streak: number;
  fastest_bpm: number;
  accuracy_average: number;
  total_attempts: number;
  badges: string[];
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }

      if (data) {
        const earnedBadges = calculateBadges(data);
        setProfile({ ...data, badges: earnedBadges });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    haptics.light();
    loadProfile();
  };

  const handleSignIn = async () => {
    // In a real app, implement proper auth flow
    Alert.alert('Sign In', 'Auth flow would go here. For MVP, using anonymous auth.');

    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;

      if (data.user) {
        // Create profile
        await supabase.from('profiles').insert({
          id: data.user.id,
          username: `User${Math.floor(Math.random() * 10000)}`,
        });

        loadProfile();
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <Text className="text-gray-500">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center px-5">
        <Text className="text-white text-3xl font-black mb-4 text-center">
          Welcome to Speed Rhyme!
        </Text>
        <Text className="text-gray-400 text-center mb-8">
          Sign in to track your stats, earn badges, and compete on leaderboards
        </Text>
        <Button onPress={handleSignIn} variant="neon" size="large">
          Get Started
        </Button>
      </SafeAreaView>
    );
  }

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
        {/* Profile Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="mt-6 mb-8">
          <LinearGradient
            colors={['#00F0FF', '#BC13FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-full w-24 h-24 items-center justify-center mb-4"
          >
            <Text className="text-white text-4xl font-black">
              {profile.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </LinearGradient>

          <Text className="text-white text-3xl font-black mb-1">
            {profile.username || 'Anonymous'}
          </Text>
          <Text className="text-gray-400 text-base">
            {profile.total_attempts} challenges completed
          </Text>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-8">
          <Text className="text-white text-xl font-black mb-4">📊 Your Stats</Text>

          <View className="flex-row gap-3 mb-3">
            <StatCard
              label="Best Streak"
              value={profile.best_streak}
              icon="🔥"
              color="#FF1CF7"
            />
            <StatCard
              label="Fastest BPM"
              value={profile.fastest_bpm}
              icon="⚡"
              color="#FFFC00"
            />
          </View>

          <View className="flex-row gap-3">
            <StatCard
              label="Avg Accuracy"
              value={`${profile.accuracy_average.toFixed(1)}%`}
              icon="🎯"
              color="#39FF14"
            />
            <StatCard
              label="Total Plays"
              value={profile.total_attempts}
              icon="🎮"
              color="#00F0FF"
            />
          </View>
        </Animated.View>

        {/* Badges */}
        <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-8">
          <Text className="text-white text-xl font-black mb-4">
            🏆 Badges ({profile.badges.length})
          </Text>

          {profile.badges.length === 0 ? (
            <View className="bg-dark-card rounded-2xl p-6 items-center">
              <Text className="text-gray-500 text-center">
                Complete challenges to earn badges!
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap">
              {profile.badges.map((badge, index) => (
                <Badge key={badge} badge={badge} index={index} />
              ))}
            </View>
          )}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text className="text-white text-xl font-black mb-4">⚡ Quick Actions</Text>

          <View className="gap-3">
            <Button variant="secondary" onPress={() => {}}>
              📜 View All Attempts
            </Button>
            <Button variant="secondary" onPress={() => {}}>
              🏅 My Challenges
            </Button>
            <Button variant="secondary" onPress={() => {}}>
              ⚙️ Settings
            </Button>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
