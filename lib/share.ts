import * as Sharing from 'expo-sharing';

export interface ShareData {
  score: number;
  accuracy: number;
  bpm: number;
  challengeTitle: string;
  rank?: number;
  totalPlayers?: number;
}

export function generateShareCaption(data: ShareData): string {
  const { score, accuracy, bpm, challengeTitle, rank, totalPlayers } = data;

  let caption = `🎯 Just scored ${score}/100 on "${challengeTitle}"!\n\n`;

  // Add performance details
  caption += `⚡ ${bpm} BPM | `;
  caption += `🎪 ${accuracy.toFixed(1)}% accuracy\n`;

  // Add rank if available
  if (rank && totalPlayers) {
    const percentile = ((totalPlayers - rank) / totalPlayers * 100).toFixed(0);
    caption += `🏆 Rank #${rank} (Top ${percentile}%)\n`;
  }

  // Add call to action
  if (score >= 90) {
    caption += `\n🔥 Can you beat my score? Try Speed Rhyme now!`;
  } else {
    caption += `\n💪 Think you can do better? Challenge me on Speed Rhyme!`;
  }

  caption += `\n\n#SpeedRhyme #TongueTwister #ViralChallenge`;

  return caption;
}

export async function shareScore(data: ShareData): Promise<boolean> {
  try {
    const caption = generateShareCaption(data);

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.warn('Sharing is not available on this device');
      return false;
    }

    // In a real app, you'd generate an image/video here
    // For MVP, we'll share the text caption
    // You can use expo-file-system to create a share card image

    // Mock sharing for now - in production, create actual share card
    await Sharing.shareAsync('data:text/plain,' + encodeURIComponent(caption), {
      dialogTitle: 'Share your score!',
    });

    return true;
  } catch (error) {
    console.error('Failed to share:', error);
    return false;
  }
}
