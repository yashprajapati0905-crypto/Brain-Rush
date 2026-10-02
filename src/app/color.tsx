
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const API_URL = 'http://localhost:5000';

const TOTAL_ROUNDS = 5;

const COLORS = [
  { name: 'RED', value: '#EF4444' },
  { name: 'BLUE', value: '#3B82F6' },
  { name: 'GREEN', value: '#22C55E' },
  { name: 'YELLOW', value: '#EAB308' },
  { name: 'PURPLE', value: '#A855F7' },
  { name: 'ORANGE', value: '#F97316' },
];

export default function ColorRushScreen() {
  const [gameStarted, setGameStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [options, setOptions] = useState<typeof COLORS>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');

  const nextRoundTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const createRound = () => {
    const target =
      COLORS[Math.floor(Math.random() * COLORS.length)];

    const shuffled = [...COLORS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    if (!shuffled.some((color) => color.name === target.name)) {
      shuffled[Math.floor(Math.random() * shuffled.length)] = target;
    }

    setTargetColor(target);
    setOptions(
      [...shuffled].sort(() => Math.random() - 0.5)
    );
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setSaved(false);
    setScore(0);
    setRound(1);
    setMessage('');
    createRound();
  };

  const handleAnswer = (selectedColor: string) => {
    if (gameOver) return;

    let points = 0;

    if (selectedColor === targetColor.name) {
      points = 100;
      setMessage('✅ Correct! +100');
    } else {
      points = 0;
      setMessage('❌ Wrong!');
    }

    const newScore = score + points;
    setScore(newScore);

    if (round >= TOTAL_ROUNDS) {
      setGameOver(true);
      saveScore(newScore);
      return;
    }

    nextRoundTimer.current = setTimeout(() => {
      setRound((prev) => prev + 1);
      setMessage('');
      createRound();
    }, 700);
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
            game: 'Color Rush',
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
      console.log('Color Rush score save error:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (nextRoundTimer.current) {
        clearTimeout(nextRoundTimer.current);
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
            Color Rush
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.startContainer}>
          <Text style={styles.bigEmoji}>🎨</Text>

          <Text style={styles.title}>
            Color Rush
          </Text>

          <Text style={styles.description}>
            Test your color recognition and focus.
          </Text>

          <Text style={styles.instructions}>
            Choose the correct color in each round.
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              🎯 5 Rounds
            </Text>

            <Text style={styles.infoText}>
              💯 +100 Points
            </Text>

            <Text style={styles.infoText}>
              🧠 Test Your Focus
            </Text>
          </View>

          <Pressable
            style={styles.startButton}
            onPress={startGame}
          >
            <Text style={styles.startButtonText}>
              🎨 START GAME
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
            Color Rush Complete!
          </Text>

          <Text style={styles.scoreLabel}>
            YOUR SCORE
          </Text>

          <Text style={styles.finalScore}>
            {score}
          </Text>

          <Text style={styles.roundResult}>
            {score === 500
              ? '🔥 Perfect Score!'
              : '💪 Nice Try!'}
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
          Color Rush
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

      {/* QUESTION */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionLabel}>
          FIND THIS COLOR
        </Text>

        <View
          style={[
            styles.colorPreview,
            {
              backgroundColor: targetColor.value,
            },
          ]}
        />

        <Text style={styles.targetName}>
          {targetColor.name}
        </Text>

        <Text style={styles.chooseText}>
          Choose the correct color below
        </Text>
      </View>

      {/* OPTIONS */}
      <View style={styles.optionsContainer}>
        {options.map((color) => (
          <Pressable
            key={color.name}
            style={[
              styles.colorOption,
              {
                backgroundColor: color.value,
              },
            ]}
            onPress={() => handleAnswer(color.name)}
          >
            <Text style={styles.optionText}>
              {color.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* MESSAGE */}
      {message !== '' && (
        <Text style={styles.message}>
          {message}
        </Text>
      )}
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
    fontSize: 21,
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

  questionContainer: {
    alignItems: 'center',
    marginTop: 30,
  },

  questionLabel: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  colorPreview: {
    width: 105,
    height: 105,
    borderRadius: 25,
    marginTop: 15,
    borderWidth: 4,
    borderColor: '#ffffff',
  },

  targetName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },

  chooseText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 5,
  },

  optionsContainer: {
    marginTop: 25,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  colorOption: {
    width: '48%',
    height: 75,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  optionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 3,
  },

  message: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
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
