import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { haptics } from '@/lib/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CreateScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [phrase, setPhrase] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [bpm, setBpm] = useState(100);
  const [mode, setMode] = useState<'fixed' | 'ramp' | 'ladder'>('fixed');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const bpmPresets = [80, 100, 120, 140, 160];
  const difficultyLevels = [
    { value: 1, label: 'EASY', color: '#39FF14' },
    { value: 2, label: 'MEDIUM', color: '#FFFC00' },
    { value: 3, label: 'HARD', color: '#FF8C00' },
    { value: 4, label: 'EXTREME', color: '#FF1CF7' },
    { value: 5, label: 'INSANE', color: '#FF1744' },
  ];

  const modes = [
    { value: 'fixed', label: 'Fixed BPM', description: 'Same speed throughout' },
    { value: 'ramp', label: 'Ramp BPM', description: 'Speed increases gradually' },
    { value: 'ladder', label: '3-Take Ladder', description: 'Three attempts, best score wins' },
  ];

  const handleCreate = async () => {
    if (!title.trim() || !phrase.trim()) {
      Alert.alert('Missing Info', 'Please enter both a title and phrase');
      return;
    }

    try {
      setLoading(true);
      haptics.medium();

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        Alert.alert('Error', 'You must be signed in to create challenges');
        return;
      }

      const { error } = await supabase.from('challenges').insert({
        title: title.trim(),
        phrase: phrase.trim(),
        difficulty,
        bpm,
        mode,
        is_public: isPublic,
        created_by: userData.user.id,
      });

      if (error) throw error;

      haptics.success();
      Alert.alert('Success!', 'Your challenge has been created!', [
        {
          text: 'OK',
          onPress: () => {
            setTitle('');
            setPhrase('');
            setDifficulty(3);
            setBpm(100);
            setMode('fixed');
            router.push('/');
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating challenge:', error);
      haptics.error();
      Alert.alert('Error', 'Failed to create challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={['top']}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        <Animated.View entering={FadeInDown.delay(100).springify()} className="mt-6 mb-8">
          <Text className="text-white text-4xl font-black mb-2">Create Challenge</Text>
          <Text className="text-gray-400 text-base">Design your viral tongue twister</Text>
        </Animated.View>

        {/* Title Input */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-6">
          <Text className="text-white text-sm font-bold mb-2 uppercase">Challenge Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Speed Demon Pro"
            placeholderTextColor="#666"
            className="bg-dark-card text-white rounded-2xl px-5 py-4 text-base border border-dark-border"
            maxLength={50}
          />
        </Animated.View>

        {/* Phrase Input */}
        <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-6">
          <Text className="text-white text-sm font-bold mb-2 uppercase">Phrase / Tongue Twister</Text>
          <TextInput
            value={phrase}
            onChangeText={setPhrase}
            placeholder="e.g., She sells seashells by the seashore"
            placeholderTextColor="#666"
            className="bg-dark-card text-white rounded-2xl px-5 py-4 text-base border border-dark-border"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={200}
          />
          <Text className="text-gray-500 text-xs mt-2">{phrase.length}/200 characters</Text>
        </Animated.View>

        {/* Difficulty */}
        <Animated.View entering={FadeInDown.delay(400).springify()} className="mb-6">
          <Text className="text-white text-sm font-bold mb-3 uppercase">Difficulty</Text>
          <View className="flex-row flex-wrap gap-2">
            {difficultyLevels.map((level) => (
              <Button
                key={level.value}
                onPress={() => {
                  setDifficulty(level.value);
                  haptics.light();
                }}
                variant={difficulty === level.value ? 'neon' : 'secondary'}
                size="small"
                className="flex-1 min-w-[30%]"
              >
                {level.label}
              </Button>
            ))}
          </View>
        </Animated.View>

        {/* BPM Presets */}
        <Animated.View entering={FadeInDown.delay(500).springify()} className="mb-6">
          <Text className="text-white text-sm font-bold mb-3 uppercase">Starting BPM</Text>
          <View className="flex-row flex-wrap gap-2">
            {bpmPresets.map((preset) => (
              <Button
                key={preset}
                onPress={() => {
                  setBpm(preset);
                  haptics.light();
                }}
                variant={bpm === preset ? 'neon' : 'secondary'}
                size="small"
                className="flex-1 min-w-[18%]"
              >
                {preset}
              </Button>
            ))}
          </View>
        </Animated.View>

        {/* Mode */}
        <Animated.View entering={FadeInDown.delay(600).springify()} className="mb-6">
          <Text className="text-white text-sm font-bold mb-3 uppercase">Mode</Text>
          {modes.map((modeOption) => (
            <Button
              key={modeOption.value}
              onPress={() => {
                setMode(modeOption.value as any);
                haptics.light();
              }}
              variant={mode === modeOption.value ? 'neon' : 'secondary'}
              className="mb-2"
            >
              <View>
                <Text className="text-white font-bold text-base">{modeOption.label}</Text>
                <Text className="text-white/60 text-xs">{modeOption.description}</Text>
              </View>
            </Button>
          ))}
        </Animated.View>

        {/* Visibility Toggle */}
        <Animated.View entering={FadeInDown.delay(700).springify()} className="mb-8">
          <Button
            onPress={() => {
              setIsPublic(!isPublic);
              haptics.light();
            }}
            variant={isPublic ? 'primary' : 'secondary'}
          >
            {isPublic ? '🌍 Public Challenge' : '🔒 Unlisted Challenge'}
          </Button>
        </Animated.View>

        {/* Create Button */}
        <Animated.View entering={FadeInDown.delay(800).springify()}>
          <Button
            onPress={handleCreate}
            variant="neon"
            size="large"
            loading={loading}
            disabled={!title.trim() || !phrase.trim()}
          >
            🚀 Create Challenge
          </Button>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
