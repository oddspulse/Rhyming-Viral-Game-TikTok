import React, { useEffect, useState, useRef } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/Button';
import { ScoreDisplay, StatCard } from '@/components/ScoreDisplay';
import { getScoreMessage, getWordDifferences } from '@/lib/scoring';
import { shareScore } from '@/lib/share';
import { haptics } from '@/lib/haptics';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

interface Attempt {
  id: string;
  challenge_id: string;
  score: number;
  accuracy: number;
  bpm_completed: number;
  transcript: string | null;
  is_personal_best: boolean;
}

interface Challenge {
  id: string;
  title: string;
  phrase: string;
}

export default function ResultsScreen() {
  const { attemptId } = useLocalSearchParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    loadResults();
  }, [attemptId]);

  useEffect(() => {
    if (attempt && attempt.score >= 90) {
      // Delay confetti to sync with score reveal
      setTimeout(() => {
        confettiRef.current?.start();
        haptics.scoreReveal(attempt.score);
      }, 2500);
    } else if (attempt) {
      setTimeout(() => {
        haptics.scoreReveal(attempt.score);
      }, 2500);
    }
  }, [attempt]);

  const loadResults = async () => {
    try {
      // Load attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;
      setAttempt(attemptData);

      // Load challenge
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('id, title, phrase')
        .eq('id', attemptData.challenge_id)
        .single();

      if (challengeError) throw challengeError;
      setChallenge(challengeData);

      // Calculate rank
      const { data: betterScores, count } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq('challenge_id', attemptData.challenge_id)
        .gt('score', attemptData.score);

      const currentRank = (count || 0) + 1;
      setRank(currentRank);

      // Get total players
      const { count: totalCount } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq('challenge_id', attemptData.challenge_id);

      setTotalPlayers(totalCount || 0);
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const handleShare = async () => {
    if (!attempt || !challenge) return;

    haptics.medium();

    const success = await shareScore({
      score: attempt.score,
      accuracy: attempt.accuracy,
      bpm: attempt.bpm_completed,
      challengeTitle: challenge.title,
      rank: rank || undefined,
      totalPlayers: totalPlayers || undefined,
    });

    if (success) {
      haptics.success();
    }
  };

  const handleTryAgain = () => {
    haptics.medium();
    router.back();
  };

  const handleViewLeaderboard = () => {
    haptics.medium();
    router.push(`/leaderboard/${challenge?.id}`);
  };

  const handleHome = () => {
    haptics.medium();
    router.push('/');
  };

  if (!attempt || !challenge) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <Text className="text-gray-500">Loading results...</Text>
      </SafeAreaView>
    );
  }

  const percentile = totalPlayers > 0
    ? Math.round(((totalPlayers - (rank || 0)) / totalPlayers) * 100)
    : 0;

  const message = getScoreMessage(attempt.score, attempt.is_personal_best);

  const wordDiffs = attempt.transcript
    ? getWordDifferences(challenge.phrase, attempt.transcript)
    : [];

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={['top']}>
      {/* Confetti */}
      {attempt.score >= 90 && (
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          fadeOut
        />
      )}

      <View className="flex-1 px-5 py-8">
        {/* Score Display */}
        <Animated.View entering={FadeIn.delay(500)} className="items-center mb-8 mt-8">
          <ScoreDisplay score={attempt.score} animate size="large" />

          <Animated.View entering={FadeInUp.delay(2500).springify()} className="mt-6">
            <Text className="text-white text-2xl font-black text-center mb-2">
              {message}
            </Text>

            {attempt.is_personal_best && (
              <View className="bg-neon-green/20 px-6 py-3 rounded-2xl self-center">
                <Text className="text-neon-green text-base font-bold">
                  ⭐ PERSONAL BEST
                </Text>
              </View>
            )}
          </Animated.View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(2700).springify()} className="mb-8">
          <View className="flex-row gap-3 mb-3">
            <StatCard
              label="Accuracy"
              value={`${attempt.accuracy.toFixed(1)}%`}
              icon="🎯"
              color="#39FF14"
            />
            <StatCard
              label="BPM"
              value={attempt.bpm_completed}
              icon="⚡"
              color="#FFFC00"
            />
          </View>

          {rank && (
            <View className="flex-row gap-3">
              <StatCard
                label="Your Rank"
                value={`#${rank}`}
                icon="🏆"
                color="#FF1CF7"
              />
              <StatCard
                label="Percentile"
                value={`Top ${percentile}%`}
                icon="📊"
                color="#00F0FF"
              />
            </View>
          )}
        </Animated.View>

        {/* Word Differences */}
        {wordDiffs.length > 0 && (
          <Animated.View entering={FadeInDown.delay(2900).springify()} className="mb-8">
            <Text className="text-white text-sm font-bold mb-3 uppercase">Transcript</Text>
            <View className="bg-dark-card rounded-2xl p-4 border border-dark-border">
              <View className="flex-row flex-wrap gap-2">
                {wordDiffs.map((diff, index) => {
                  const colorMap = {
                    correct: 'text-neon-green',
                    incorrect: 'text-neon-pink',
                    missing: 'text-gray-600 line-through',
                    extra: 'text-neon-yellow',
                  };

                  return (
                    <Text
                      key={index}
                      className={`${colorMap[diff.type]} text-base font-semibold`}
                    >
                      {diff.word}
                    </Text>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(3100).springify()} className="gap-3 mt-auto">
          <Button onPress={handleShare} variant="neon" size="large">
            <View className="flex-row items-center gap-2">
              <Ionicons name="share-social" size={20} color="white" />
              <Text className="text-white text-lg font-bold">Share Score</Text>
            </View>
          </Button>

          <View className="flex-row gap-3">
            <Button onPress={handleTryAgain} variant="primary" className="flex-1">
              🔄 Try Again
            </Button>
            <Button onPress={handleViewLeaderboard} variant="secondary" className="flex-1">
              🏆 Leaderboard
            </Button>
          </View>

          <Button onPress={handleHome} variant="secondary">
            🏠 Home
          </Button>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
