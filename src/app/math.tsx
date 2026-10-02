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

export default function MathRushScreen() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<number[]>([]);
  const [answer, setAnswer] = useState(0);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [saving, setSaving] = useState(false);

  const scoreRef = useRef(0);
  const gameEndedRef = useRef(false);

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate unique wrong answers
  const createOptions = (correctAnswer: number) => {
    const optionSet = new Set<number>();

    optionSet.add(correctAnswer);

    while (optionSet.size < 4) {
      const difference =
        Math.floor(Math.random() * 15) + 1;

      const direction =
        Math.random() > 0.5 ? 1 : -1;

      const wrongAnswer =
        correctAnswer + difference * direction;

      if (wrongAnswer >= 0) {
        optionSet.add(wrongAnswer);
      }
    }

    return Array.from(optionSet).sort(
      () => Math.random() - 0.5
    );
  };

  // Generate + - * / question
  const generateQuestion = () => {
    const operations = ['+', '-', '*', '/'];

    const operation =
      operations[
        Math.floor(Math.random() * operations.length)
      ];

    let num1 = 0;
    let num2 = 0;
    let correctAnswer = 0;

    if (operation === '+') {
      num1 = Math.floor(Math.random() * 30) + 1;
      num2 = Math.floor(Math.random() * 30) + 1;

      correctAnswer = num1 + num2;
    }

    if (operation === '-') {
      num1 = Math.floor(Math.random() * 30) + 10;
      num2 = Math.floor(Math.random() * 20) + 1;

      if (num2 > num1) {
        [num1, num2] = [num2, num1];
      }

      correctAnswer = num1 - num2;
    }

    if (operation === '*') {
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;

      correctAnswer = num1 * num2;
    }

    if (operation === '/') {
      // Create division with whole-number answer
      num2 = Math.floor(Math.random() * 10) + 2;
      correctAnswer =
        Math.floor(Math.random() * 12) + 1;

      num1 = num2 * correctAnswer;
    }

    setQuestion(
      `${num1} ${operation} ${num2} = ?`
    );

    setAnswer(correctAnswer);

    setOptions(
      createOptions(correctAnswer)
    );
  };

  const saveScore = async (finalScore: number) => {
    try {
      setSaving(true);

      const token =
        await AsyncStorage.getItem('token');

      if (!token) {
        router.replace('/');
        return null;
      }

      // Previous user data
      const oldUserString =
        await AsyncStorage.getItem('user');

      let oldAchievements: string[] = [];

      if (oldUserString) {
        try {
          const oldUser = JSON.parse(oldUserString);

          oldAchievements =
            oldUser.achievements || [];
        } catch (error) {
          console.log(
            'Old user parse error:',
            error
          );
        }
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
            game: 'Math Rush',
            score: finalScore,
          }),
        }
      );

      const data = await response.json();

      console.log('Math score response:', data);

      if (response.ok && data.user) {
        await AsyncStorage.setItem(
          'user',
          JSON.stringify(data.user)
        );

        const updatedAchievements =
          data.user.achievements || [];

        const unlockedNow =
          updatedAchievements.find(
            (achievementId: string) =>
              !oldAchievements.includes(
                achievementId
              )
          );

        return {
          user: data.user,
          achievement: unlockedNow || '',
        };
      }

      return null;
    } catch (error) {
      console.error(
        'SAVE SCORE ERROR:',
        error
      );

      return null;
    } finally {
      setSaving(false);
    }
  };

  const endGame = async () => {
    if (gameEndedRef.current) {
      return;
    }

    gameEndedRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const finalScore = scoreRef.current;

    const result = await saveScore(finalScore);

    if (result?.user) {
      router.replace({
        pathname: '/result',
        params: {
          game: 'Math Rush',
          score: String(finalScore),
          xp: String(finalScore),
          bestScore: String(
            result.user.bestScore
          ),
          streak: String(
            result.user.streak
          ),
          achievement:
            result.achievement || '',
        },
      });
    } else {
      // If API fails, still show result
      router.replace({
        pathname: '/result',
        params: {
          game: 'Math Rush',
          score: String(finalScore),
          xp: String(finalScore),
          bestScore: String(finalScore),
          streak: '0',
          achievement: '',
        },
      });
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          if (timerRef.current) {
            clearInterval(
              timerRef.current
            );

            timerRef.current = null;
          }

          endGame();

          return 0;
        }

        return previousTime - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    generateQuestion();
    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );

        timerRef.current = null;
      }
    };
  }, []);

  const handleAnswer = (
    selectedAnswer: number
  ) => {
    if (gameEndedRef.current) {
      return;
    }

    if (selectedAnswer === answer) {
      const newScore =
        scoreRef.current + 10;

      scoreRef.current = newScore;
      setScore(newScore);
    }

    generateQuestion();
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>
        ➗ Math Rush
      </Text>

      <Text style={styles.subtitle}>
        Solve +  −  ×  ÷ questions
      </Text>

      {/* TIMER */}
      <View style={styles.timerBox}>
        <Text style={styles.timer}>
          ⏱️ {timeLeft}s
        </Text>
      </View>

      {/* SCORE */}
      <View style={styles.scoreBox}>
        <Text style={styles.score}>
          Score: {score}
        </Text>
      </View>

      {/* QUESTION */}
      <View style={styles.questionBox}>
        <Text style={styles.question}>
          {question}
        </Text>
      </View>

      {/* OPTIONS */}
      <View style={styles.optionsContainer}>
        {options.map(
          (option, index) => (
            <Pressable
              key={`${option}-${index}`}
              style={({ pressed }) => [
                styles.option,
                pressed &&
                  styles.optionPressed,
              ]}
              onPress={() =>
                handleAnswer(option)
              }
              disabled={saving}
            >
              <Text style={styles.optionText}>
                {option}
              </Text>
            </Pressable>
          )
        )}
      </View>

      {saving && (
        <Text style={styles.savingText}>
          Saving score...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101828',
    padding: 20,
    justifyContent: 'center',
  },

  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 25,
  },

  timerBox: {
    alignItems: 'center',
    marginBottom: 12,
  },

  timer: {
    color: '#FBBF24',
    fontSize: 22,
    fontWeight: 'bold',
  },

  scoreBox: {
    alignItems: 'center',
    marginBottom: 25,
  },

  score: {
    color: '#818CF8',
    fontSize: 20,
    fontWeight: 'bold',
  },

  questionBox: {
    backgroundColor: '#1F2937',
    borderRadius: 22,
    paddingVertical: 30,
    paddingHorizontal: 15,
    marginBottom: 25,
  },

  question: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  optionsContainer: {
    gap: 13,
  },

  option: {
    backgroundColor: '#1F2937',
    paddingVertical: 19,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },

  optionPressed: {
    backgroundColor: '#312E81',
  },

  optionText: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: 'bold',
  },

  savingText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
  },
});