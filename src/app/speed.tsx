
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const API_URL = 'https://brain-rush-backend.onrender.com';

const TOTAL_ROUNDS = 10;

export default function SpeedTapRushScreen() {
  const [gameStarted, setGameStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [targetVisible, setTargetVisible] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');

  const targetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTime = useRef<number>(0);

  const showTarget = () => {
    setMessage('');
    setTargetVisible(true);
    startTime.current = Date.now();
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setSaved(false);
    setScore(0);
    setRound(1);
    setTargetVisible(false);
    setMessage('Get ready...');

    setTimeout(() => {
      showTarget();
    }, 800);
  };

  const handleTargetPress = () => {
    if (!targetVisible || gameOver) {
      return;
    }

    const reactionTime = Date.now() - startTime.current;

    let points = 0;

    if (reactionTime <= 300) {
      points = 100;
    } else if (reactionTime <= 500) {
      points = 90;
    } else if (reactionTime <= 700) {
      points = 80;
    } else if (reactionTime <= 1000) {
      points = 70;
    } else if (reactionTime <= 1500) {
      points = 60;
    } else {
      points = 50;
    }

    const newScore = score + points;

    setScore(newScore);
    setTargetVisible(false);

    setMessage(
      `⚡ ${reactionTime}ms  +${points} points`
    );

    if (round >= TOTAL_ROUNDS) {
      setGameOver(true);
      saveScore(newScore);
      return;
    }

    setTimeout(() => {
      setRound((prev) => prev + 1);
      showTarget();
    }, 800);
  };

  const saveScore = async (finalScore: number) => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/game/score`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            game: 'Speed Tap Rush',
            score: finalScore,
          }),
        }
      );

      if (response.ok) {
        setSaved(true);

        const data = await response.json();

        if (data.user) {
          await AsyncStorage.setItem(
            'user',
            JSON.stringify(data.user)
          );
        }
      }
    } catch (error) {
      console.log(
        'Speed Tap Rush score save error:',
        error
      );
    }
  };

  useEffect(() => {
    return () => {
      if (targetTimer.current) {
        clearTimeout(targetTimer.current);
      }
    };
  }, []);

  if (!gameStarted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Speed Tap Rush
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.startContainer}>
          <Text style={styles.bigEmoji}>
            ⚡
          </Text>

          <Text style={styles.title}>
            Speed Tap Rush
          </Text>

          <Text style={styles.description}>
            Test your reaction speed!
          </Text>

          <Text style={styles.instructions}>
            Tap the target as quickly as possible.
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              ⚡ 10 Rounds
            </Text>

            <Text style={styles.infoText}>
              🎯 Up to 100 Points
            </Text>

            <Text style={styles.infoText}>
              🏆 Faster = Higher Score
            </Text>
          </View>

          <Pressable
            style={styles.startButton}
            onPress={startGame}
          >
            <Text style={styles.startButtonText}>
              ⚡ START GAME
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (gameOver) {
    return (
      <View style={styles.container}>
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverEmoji}>
            🎉
          </Text>

          <Text style={styles.gameOverTitle}>
            Speed Tap Complete!
          </Text>

          <Text style={styles.scoreLabel}>
            YOUR SCORE
          </Text>

          <Text style={styles.finalScore}>
            {score}
          </Text>

          <Text style={styles.roundResult}>
            {score >= 900
              ? '🔥 Lightning Fast!'
              : score >= 700
              ? '⚡ Great Speed!'
              : '💪 Keep Practicing!'}
          </Text>

          {saved && (
            <Text style={styles.savedText}>
              ✓ Score saved successfully
            </Text>
          )}

          <Pressable
            style={styles.startButton}
            onPress={startGame}
          >
            <Text style={styles.startButtonText}>
              🔄 PLAY AGAIN
            </Text>
          </Pressable>

          <Pressable
            style={styles.homeButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.homeButtonText}>
              🏠 HOME
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          Speed Tap Rush
        </Text>

        <View style={styles.headerSpace} />
      </View>

      {/* GAME INFO */}
      <View style={styles.gameInfo}>
        <View>
          <Text style={styles.infoLabel}>
            ROUND
          </Text>

          <Text style={styles.infoValue}>
            {round} / {TOTAL_ROUNDS}
          </Text>
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.infoLabel}>
            SCORE
          </Text>

          <Text style={styles.infoValue}>
            {score}
          </Text>
        </View>
      </View>

      {/* GAME AREA */}
      <View style={styles.gameArea}>
        {!targetVisible && (
          <View style={styles.waitingBox}>
            <Text style={styles.waitingEmoji}>
              👀
            </Text>

            <Text style={styles.waitingText}>
              {message || 'Get ready...'}
            </Text>
          </View>
        )}

        {targetVisible && (
          <Pressable
            style={styles.target}
            onPress={handleTargetPress}
          >
            <Text style={styles.targetText}>
              TAP!
            </Text>
          </Pressable>
        )}
      </View>

      {message !== '' && !targetVisible && (
        <Text style={styles.message}>
          {message}
        </Text>
      )}

      <Text style={styles.bottomHint}>
        Tap the target as fast as you can ⚡
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101828',
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 40,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: '#ffffff',
    fontSize: 35,
    lineHeight: 38,
  },

  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  headerSpace: {
    width: 45,
  },

  startContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },

  bigEmoji: {
    fontSize: 75,
    marginBottom: 15,
  },

  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },

  description: {
    color: '#D1D5DB',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
  },

  instructions: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },

  infoCard: {
    width: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 18,
    padding: 18,
    marginTop: 25,
  },

  infoText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginVertical: 5,
    textAlign: 'center',
  },

  startButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 25,
  },

  startButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  gameInfo: {
    marginTop: 25,
    backgroundColor: '#1F2937',
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  infoValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 3,
  },

  scoreBox: {
    alignItems: 'flex-end',
  },

  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  waitingBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  waitingEmoji: {
    fontSize: 65,
  },

  waitingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },

  target: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: '#818CF8',
    elevation: 10,
  },

  targetText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  message: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },

  bottomHint: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 25,
  },

  gameOverContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },

  gameOverEmoji: {
    fontSize: 70,
  },

  gameOverTitle: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },

  scoreLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 30,
  },

  finalScore: {
    color: '#818CF8',
    fontSize: 60,
    fontWeight: 'bold',
    marginTop: 5,
  },

  roundResult: {
    color: '#D1D5DB',
    fontSize: 15,
    marginTop: 5,
  },

  savedText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 12,
  },

  homeButton: {
    width: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 12,
  },

  homeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
