/**
 * Speech-to-Text Scoring Engine
 * Uses Levenshtein distance for accuracy calculation
 */

// Calculate Levenshtein distance between two strings
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Normalize strings
  const strA = a.toLowerCase().trim();
  const strB = b.toLowerCase().trim();

  if (strA.length === 0) return strB.length;
  if (strB.length === 0) return strA.length;

  // Initialize matrix
  for (let i = 0; i <= strB.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= strA.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= strB.length; i++) {
    for (let j = 1; j <= strA.length; j++) {
      if (strB.charAt(i - 1) === strA.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[strB.length][strA.length];
}

// Tokenize text into words
export function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

// Calculate accuracy percentage
export function calculateAccuracy(targetPhrase: string, transcript: string): number {
  const targetTokens = tokenize(targetPhrase);
  const transcriptTokens = tokenize(transcript);

  if (targetTokens.length === 0) return 0;

  const distance = levenshteinDistance(
    targetTokens.join(' '),
    transcriptTokens.join(' ')
  );

  const maxLength = Math.max(targetTokens.length, transcriptTokens.length);
  const accuracy = 1 - (distance / maxLength);

  return Math.max(0, Math.min(100, accuracy * 100));
}

// Calculate speed bonus based on BPM
export function calculateSpeedBonus(bpm: number, baseBpm: number = 100): number {
  if (bpm <= baseBpm) return 0;

  const ratio = bpm / baseBpm;
  const bonus = Math.min(20, (ratio - 1) * 10);

  return Math.round(bonus);
}

// Calculate final score
export function calculateScore(
  targetPhrase: string,
  transcript: string,
  bpm: number,
  baseBpm: number = 100
): {
  score: number;
  accuracy: number;
  speedBonus: number;
  isTopScore: boolean;
  isPerfect: boolean;
} {
  const accuracy = calculateAccuracy(targetPhrase, transcript);
  const speedBonus = calculateSpeedBonus(bpm, baseBpm);

  // Score formula: accuracy * 0.8 + speedBonus
  const baseScore = (accuracy * 0.8) + speedBonus;
  const score = Math.min(100, Math.round(baseScore));

  return {
    score,
    accuracy: Math.round(accuracy * 100) / 100,
    speedBonus,
    isTopScore: score >= 90,
    isPerfect: score === 100,
  };
}

// Get score color based on score value
export function getScoreColor(score: number): string {
  if (score >= 90) return '#39FF14'; // neon green
  if (score >= 70) return '#FFFC00'; // neon yellow
  if (score >= 50) return '#FF8C00'; // orange
  return '#FF1CF7'; // neon pink
}

// Get score message based on performance
export function getScoreMessage(score: number, isPersonalBest: boolean, previousBest?: number): string {
  if (isPersonalBest) {
    if (previousBest && score - previousBest <= 5) {
      return `New PB! Just barely beat it! 🔥`;
    }
    return '🎉 NEW PERSONAL BEST!';
  }

  if (previousBest && previousBest - score <= 5) {
    return `So close! Only ${Math.round(previousBest - score)} points away! 😤`;
  }

  if (score >= 95) return 'LEGENDARY! 👑';
  if (score >= 90) return 'INCREDIBLE! 🔥';
  if (score >= 80) return 'AMAZING! ⚡';
  if (score >= 70) return 'NICE! 💪';
  if (score >= 50) return 'GOOD TRY! 👍';
  return 'KEEP GOING! 💫';
}

// Highlight word differences
export interface WordDiff {
  word: string;
  type: 'correct' | 'incorrect' | 'missing' | 'extra';
}

export function getWordDifferences(targetPhrase: string, transcript: string): WordDiff[] {
  const targetWords = tokenize(targetPhrase);
  const transcriptWords = tokenize(transcript);

  const diffs: WordDiff[] = [];

  const maxLength = Math.max(targetWords.length, transcriptWords.length);

  for (let i = 0; i < maxLength; i++) {
    const targetWord = targetWords[i];
    const transcriptWord = transcriptWords[i];

    if (!targetWord && transcriptWord) {
      diffs.push({ word: transcriptWord, type: 'extra' });
    } else if (targetWord && !transcriptWord) {
      diffs.push({ word: targetWord, type: 'missing' });
    } else if (targetWord === transcriptWord) {
      diffs.push({ word: targetWord, type: 'correct' });
    } else {
      diffs.push({ word: transcriptWord || targetWord, type: 'incorrect' });
    }
  }

  return diffs;
}

// Badge calculation
export function calculateBadges(profile: {
  total_attempts: number;
  fastest_bpm: number;
  accuracy_average: number;
  best_streak: number;
}): string[] {
  const badges: string[] = [];

  // Attempt-based badges
  if (profile.total_attempts >= 100) badges.push('VETERAN');
  if (profile.total_attempts >= 50) badges.push('COMMITTED');
  if (profile.total_attempts >= 10) badges.push('STARTER');

  // Speed badges
  if (profile.fastest_bpm >= 160) badges.push('SPEED_DEMON');
  if (profile.fastest_bpm >= 140) badges.push('FAST_TALKER');

  // Accuracy badges
  if (profile.accuracy_average >= 95) badges.push('PERFECTIONIST');
  if (profile.accuracy_average >= 85) badges.push('PRECISE');

  // Streak badges
  if (profile.best_streak >= 7) badges.push('WEEK_WARRIOR');
  if (profile.best_streak >= 3) badges.push('HAT_TRICK');

  return badges;
}

// Get badge display info
export function getBadgeInfo(badge: string): { emoji: string; label: string; color: string } {
  const badgeMap: Record<string, { emoji: string; label: string; color: string }> = {
    VETERAN: { emoji: '🏆', label: '100+ Attempts', color: '#FFD700' },
    COMMITTED: { emoji: '💪', label: '50+ Attempts', color: '#C0C0C0' },
    STARTER: { emoji: '🌟', label: '10+ Attempts', color: '#CD7F32' },
    SPEED_DEMON: { emoji: '⚡', label: '160+ BPM', color: '#FF1CF7' },
    FAST_TALKER: { emoji: '🔥', label: '140+ BPM', color: '#FF8C00' },
    PERFECTIONIST: { emoji: '💎', label: '95%+ Accuracy', color: '#00F0FF' },
    PRECISE: { emoji: '🎯', label: '85%+ Accuracy', color: '#39FF14' },
    WEEK_WARRIOR: { emoji: '📅', label: '7-Day Streak', color: '#BC13FE' },
    HAT_TRICK: { emoji: '🎩', label: '3-Day Streak', color: '#FFFC00' },
  };

  return badgeMap[badge] || { emoji: '✨', label: badge, color: '#FFFFFF' };
}
