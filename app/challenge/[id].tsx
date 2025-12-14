import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Button, IconButton } from '@/components/Button';
import { PulseRing, RecordButton } from '@/components/Animations';
import { calculateScore } from '@/lib/scoring';
import { haptics } from '@/lib/haptics';
import { soundManager } from '@/lib/sounds';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface Challenge {
  id: string;
  title: string;
  phrase: string;
  difficulty: number;
  bpm: number;
  mode: string;
  created_by: string;
}

export default function ChallengePlayScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isBeatActive, setIsBeatActive] = useState(false);

  const beatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shakeValue = useSharedValue(0);

  useEffect(() => {
    loadChallenge();
    setupAudio();

    return () => {
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [id]);

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Failed to setup audio:', error);
    }
  };

  const loadChallenge = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setChallenge(data);
    } catch (error) {
      console.error('Error loading challenge:', error);
      Alert.alert('Error', 'Failed to load challenge');
      router.back();
    }
  };

  const startBeatMetronome = (bpm: number) => {
    const interval = (60 / bpm) * 1000;

    beatIntervalRef.current = setInterval(() => {
      soundManager.playTick();
      haptics.beat();
      setIsBeatActive(true);
      setTimeout(() => setIsBeatActive(false), 100);
    }, interval);
  };

  const stopBeatMetronome = () => {
    if (beatIntervalRef.current) {
      clearInterval(beatIntervalRef.current);
      beatIntervalRef.current = null;
    }
    setIsBeatActive(false);
  };

  const startCountdown = () => {
    haptics.medium();
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          setTimeout(() => {
            setCountdown(null);
            startRecording();
          }, 1000);
          return 0;
        }
        haptics.light();
        soundManager.playTick();
        return prev! - 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    if (!challenge) return;

    try {
      haptics.recordStart();

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      startBeatMetronome(challenge.bpm);

      // Auto-stop after 15 seconds (safety)
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 15000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording || !challenge) return;

    try {
      haptics.recordStop();
      setIsRecording(false);
      stopBeatMetronome();

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // In a real app, transcribe the audio using Whisper or native speech recognition
      // For MVP, we'll simulate with a mock transcript
      const mockTranscript = challenge.phrase; // Simulate perfect transcription for demo

      processResult(mockTranscript, uri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to process recording');
    }
  };

  const processResult = async (transcript: string, audioUri: string | null) => {
    if (!challenge) return;

    try {
      const result = calculateScore(
        challenge.phrase,
        transcript,
        challenge.bpm
      );

      // Get user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        Alert.alert('Error', 'You must be signed in to save attempts');
        return;
      }

      // Check for previous best
      const { data: previousBest } = await supabase
        .from('attempts')
        .select('score')
        .eq('user_id', userData.user.id)
        .eq('challenge_id', challenge.id)
        .order('score', { ascending: false })
        .limit(1)
        .single();

      const isPersonalBest = !previousBest || result.score > previousBest.score;

      // Save attempt
      const { data: attempt, error } = await supabase
        .from('attempts')
        .insert({
          challenge_id: challenge.id,
          user_id: userData.user.id,
          score: result.score,
          accuracy: result.accuracy,
          bpm_completed: challenge.bpm,
          transcript,
          audio_url: audioUri,
          is_personal_best: isPersonalBest,
        })
        .select()
        .single();

      if (error) throw error;

      haptics.success();

      // Navigate to results
      router.push(`/results/${attempt.id}`);
    } catch (error) {
      console.error('Error saving attempt:', error);
      Alert.alert('Error', 'Failed to save your attempt');
    }
  };

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording();
    } else if (countdown === null) {
      startCountdown();
    }
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeValue.value }],
  }));

  if (!challenge) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <Text className="text-gray-500">Loading challenge...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={['top']}>
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between">
        <IconButton
          onPress={() => {
            if (isRecording) {
              Alert.alert('Recording', 'Stop recording before going back');
            } else {
              router.back();
            }
          }}
          icon={<Ionicons name="arrow-back" size={24} color="white" />}
        />

        <View className="bg-dark-card px-4 py-2 rounded-full">
          <Text className="text-neon-blue text-sm font-bold">⚡ {challenge.bpm} BPM</Text>
        </View>
      </View>

      {/* Challenge Info */}
      <Animated.View entering={FadeInDown.delay(100).springify()} className="px-5 mb-8">
        <Text className="text-white text-3xl font-black mb-2">{challenge.title}</Text>
        <View className="bg-dark-card rounded-2xl p-1 inline-flex self-start">
          <Text className="text-gray-400 text-sm px-3 py-1">
            {['', 'EASY', 'MEDIUM', 'HARD', 'EXTREME', 'INSANE'][challenge.difficulty]}
          </Text>
        </View>
      </Animated.View>

      {/* Phrase Display */}
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={shakeStyle}
        className="flex-1 px-5 justify-center"
      >
        <View className="bg-dark-card rounded-3xl p-8 border border-dark-border">
          <Text className="text-white text-2xl font-bold text-center leading-10">
            "{challenge.phrase}"
          </Text>
        </View>

        {isRecording && (
          <Animated.View entering={FadeIn} className="mt-6 items-center">
            <Text className="text-neon-pink text-base font-bold animate-pulse">
              🎤 RECORDING...
            </Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* Record Button Area */}
      <View className="items-center pb-12">
        {countdown !== null && countdown > 0 && (
          <Animated.View
            entering={FadeIn}
            className="absolute -top-32 bg-neon-yellow rounded-full w-24 h-24 items-center justify-center"
          >
            <Text className="text-dark text-5xl font-black">{countdown}</Text>
          </Animated.View>
        )}

        <Pressable
          onPress={handleRecordPress}
          className="items-center justify-center"
          style={{ width: 200, height: 200 }}
        >
          {/* Outer rings */}
          <PulseRing size={200} color="#FF1CF7" isActive={isBeatActive} bpm={challenge.bpm} />
          <PulseRing size={180} color="#BC13FE" isActive={isBeatActive} bpm={challenge.bpm} />

          {/* Record button */}
          <RecordButton size={160} isRecording={isRecording} />
        </Pressable>

        <Text className="text-gray-400 text-sm font-bold mt-6 uppercase">
          {isRecording ? 'Tap to Stop' : countdown !== null ? 'Get Ready...' : 'Tap to Start'}
        </Text>
      </View>
    </SafeAreaView>
  );
}
