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
// Expo Go phone par test kar rahe ho to:
// const API_URL = 'http://10.194.67.91:5000';

const TOTAL_ROUNDS = 5;

export default function ReactionRush() {
  const [gameStarted, setGameStarted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [ready, setReady] = useState(false);
  const [round, setRound] = useState(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [saved, setSaved] = useState(false);

  const readyTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setSaved(false);
    setRound(1);
    setTotalScore(0);
    setReactionTime(null);

    startRound();
  };

  const startRound = () => {
    setWaiting(true);
    setReady(false);
    setReactionTime(null);

    const delay = Math.floor(Math.random() * 2500) + 1500;

    timeoutRef.current = setTimeout(() => {
      setWaiting(false);
      setReady(true);
      readyTimeRef.current = Date.now();
    }, delay);
  };

  const handleTap = () => {
    if (!gameStarted || gameOver) return;

    // User tapped before GO
    if (waiting) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setWaiting(false);
      setReady(false);
      setReactionTime(null);

      if (round >= TOTAL_ROUNDS) {
        finishGame(totalScore);
      } else {
        setTimeout(() => {
          startRound();
        }, 800);
      }

      return;
    }

    // Correct reaction
    if (ready && readyTimeRef.current) {
      const time = Date.now() - readyTimeRef.current;

      setReactionTime(time);
      setReady(false);

      const points = Math.max(10, 100 - Math.floor(time / 10));
      const newScore = totalScore + points;

      setTotalScore(newScore);

      if (round >= TOTAL_ROUNDS) {
        finishGame(newScore);
      } else {
        setTimeout(() => {
          setRound((prev) => prev + 1);
          startRound();
        }, 1000);
      }
    }
  };

  const finishGame = async (finalScore: number) => {
    setGameOver(true);
    setGameStarted(false);
    setWaiting(false);
    setReady(false);

    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        setSaved(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/game/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          game: 'Reaction Rush',
          score: finalScore,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaved(true);

        if (data.user) {
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
        }
      }
    } catch (error) {
      console.log('Error saving Reaction Rush score:', error);
    }
  };

  const getMessage = () => {
    if (totalScore >= 400) return '🔥 Amazing Reaction!';
    if (totalScore >= 300) return '⚡ Very Fast!';
    if (totalScore >= 200) return '👏 Good Job!';
    return '💪 Keep Practicing!';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>⚡ Reaction Rush</Text>

        <View style={styles.headerSpace} />
      </View>

      {/* Game Over */}
      {gameOver ? (
        <View style={styles.centerContent}>
          <Text style={styles.gameOverIcon}>🏆</Text>

          <Text style={styles.gameOverTitle}>Game Complete!</Text>

          <Text style={styles.message}>{getMessage()}</Text>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>FINAL SCORE</Text>
            <Text style={styles.score}>{totalScore}</Text>
          </View>

          {saved && (
            <Text style={styles.savedText}>✓ Score saved successfully</Text>
          )}

          <Pressable style={styles.primaryButton} onPress={startGame}>
            <Text style={styles.primaryButtonText}>🔄 Play Again</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.secondaryButtonText}>🏠 Home</Text>
          </Pressable>
        </View>
      ) : !gameStarted ? (
        <View style={styles.centerContent}>
          <Text style={styles.bigIcon}>⚡</Text>

          <Text style={styles.title}>Reaction Rush</Text>

          <Text style={styles.description}>
            Test your reaction speed!
          </Text>

          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>How to Play</Text>

            <Text style={styles.instruction}>
              1️⃣ Wait for the screen to say GO!
            </Text>

            <Text style={styles.instruction}>
              2️⃣ Tap as quickly as possible.
            </Text>

            <Text style={styles.instruction}>
              3️⃣ Complete {TOTAL_ROUNDS} rounds.
            </Text>

            <Text style={styles.instruction}>
              4️⃣ Faster reaction = higher score!
            </Text>
          </View>

          <Pressable style={styles.primaryButton} onPress={startGame}>
            <Text style={styles.primaryButtonText}>⚡ Start Game</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.gameContent}>
          {/* Round */}
          <Text style={styles.roundText}>
            Round {round} / {TOTAL_ROUNDS}
          </Text>

          {/* Score */}
          <Text style={styles.currentScore}>
            Score: {totalScore}
          </Text>

          {/* Tap Area */}
          <Pressable
            style={[
              styles.tapArea,
              waiting && styles.waitingArea,
              ready && styles.readyArea,
            ]}
            onPress={handleTap}
          >
            {waiting ? (
              <>
                <Text style={styles.tapIcon}>⏳</Text>
                <Text style={styles.waitText}>WAIT...</Text>
                <Text style={styles.smallText}>
                  Don't tap yet!
                </Text>
              </>
            ) : ready ? (
              <>
                <Text style={styles.tapIcon}>⚡</Text>
                <Text style={styles.goText}>TAP NOW!</Text>
                <Text style={styles.smallText}>
                  TAP AS FAST AS YOU CAN!
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.tapIcon}>⚡</Text>
                {reactionTime && (
                  <Text style={styles.reactionText}>
                    {reactionTime} ms
                  </Text>
                )}
              </>
            )}
          </Pressable>

          {reactionTime && !ready && (
            <Text style={styles.resultText}>
              Reaction Time: {reactionTime} ms
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1020',
  },

  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#20283d',
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#151c31',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: '#ffffff',
    fontSize: 28,
  },

  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },

  headerSpace: {
    width: 45,
  },

  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  bigIcon: {
    fontSize: 70,
    marginBottom: 10,
  },

  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
  },

  description: {
    color: '#9ca8c7',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 25,
  },

  instructionCard: {
    width: '100%',
    backgroundColor: '#151c31',
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,
  },

  instructionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 15,
  },

  instruction: {
    color: '#c5cce0',
    fontSize: 15,
    marginBottom: 10,
  },

  primaryButton: {
    width: '100%',
    backgroundColor: '#6c63ff',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },

  secondaryButton: {
    width: '100%',
    backgroundColor: '#151c31',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 12,
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },

  gameContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 25,
    paddingHorizontal: 20,
  },

  roundText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },

  currentScore: {
    color: '#9ca8c7',
    fontSize: 16,
    marginTop: 8,
  },

  tapArea: {
    width: '90%',
    aspectRatio: 1,
    maxWidth: 340,
    borderRadius: 170,
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151c31',
    borderWidth: 5,
    borderColor: '#303a58',
  },

  waitingArea: {
    backgroundColor: '#1a1f2f',
    borderColor: '#39425d',
  },

  readyArea: {
    backgroundColor: '#243b2d',
    borderColor: '#43d17a',
  },

  tapIcon: {
    fontSize: 65,
    marginBottom: 10,
  },

  waitText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
  },

  goText: {
    color: '#43d17a',
    fontSize: 30,
    fontWeight: '900',
  },

  smallText: {
    color: '#aab4ca',
    fontSize: 13,
    marginTop: 8,
  },

  reactionText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
  },

  resultText: {
    color: '#43d17a',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 20,
  },

  gameOverIcon: {
    fontSize: 75,
  },

  gameOverTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 10,
  },

  message: {
    color: '#9ca8c7',
    fontSize: 18,
    marginTop: 8,
  },

  scoreCard: {
    width: '80%',
    backgroundColor: '#151c31',
    borderRadius: 20,
    paddingVertical: 22,
    alignItems: 'center',
    marginVertical: 25,
  },

  scoreLabel: {
    color: '#9ca8c7',
    fontSize: 13,
    fontWeight: '700',
  },

  score: {
    color: '#ffffff',
    fontSize: 50,
    fontWeight: '900',
    marginTop: 5,
  },

  savedText: {
    color: '#43d17a',
    fontSize: 14,
    marginBottom: 10,
  },
});