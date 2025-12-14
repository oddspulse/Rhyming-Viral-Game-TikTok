import { Audio } from 'expo-av';

// Sound manager singleton
class SoundManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private isEnabled: boolean = true;

  async init() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Play a tick sound for metronome
  async playTick() {
    if (!this.isEnabled) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==' },
        { shouldPlay: true, volume: 0.3 }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn('Failed to play tick sound:', error);
    }
  }

  // Play a success sound
  async playSuccess() {
    if (!this.isEnabled) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==' },
        { shouldPlay: true, volume: 0.5 }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn('Failed to play success sound:', error);
    }
  }

  // Play a button tap sound
  async playTap() {
    if (!this.isEnabled) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==' },
        { shouldPlay: true, volume: 0.2 }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn('Failed to play tap sound:', error);
    }
  }

  // Cleanup
  async cleanup() {
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync();
    }
    this.sounds.clear();
  }
}

export const soundManager = new SoundManager();
