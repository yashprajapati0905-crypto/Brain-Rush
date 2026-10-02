
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// IMPORTANT:
// Mobile/Expo Go ke liye localhost ki jagah
// apne PC ka LAN IP use karo.
// Example:
// const API_URL = 'http://10.194.67.91:5000';

const API_URL = 'http://localhost:5000';

type LogicQuestion = {
  question: string;
  options: string[];
  answer: string;
};

type AchievementDetail = {
  icon: string;
  title: string;
  description: string;
};

const achievementDetails: Record<
  string,
  AchievementDetail
> = {
  first_game: {
    icon: '🥇',
    title: 'First Game',
    description: 'You completed your first game!',
  },

  high_scorer: {
    icon: '🎯',
    title: 'High Scorer',
    description: 'You scored 50 or more!',
  },

  streak_3: {
    icon: '🔥',
    title: '3 Day Streak',
    description: 'You reached a 3-day streak!',
  },

  streak_7: {
    icon: '🔥',
    title: '7 Day Streak',
    description: 'You reached a 7-day streak!',
  },

  xp_hunter: {
    icon: '⚡',
    title: 'XP Hunter',
    description: 'You earned 500 XP!',
  },

  brain_master: {
    icon: '🧠',
    title: 'Brain Master',
    description: 'You completed 20 games!',
  },
};

const questions: LogicQuestion[] = [
  {
    question: '2, 4, 6, 8, ?',
    options: ['9', '10', '11', '12'],
    answer: '10',
  },

  {
    question: '3, 6, 9, 12, ?',
    options: ['14', '15', '16', '18'],
    answer: '15',
  },

  {
    question: '5, 10, 15, 20, ?',
    options: ['23', '24', '25', '30'],
    answer: '25',
  },

  {
    question: '1, 4, 9, 16, ?',
    options: ['20', '24', '25', '36'],
    answer: '25',
  },

  {
    question: '10, 20, 30, 40, ?',
    options: ['45', '50', '55', '60'],
    answer: '50',
  },

  {
    question: '100, 90, 80, 70, ?',
    options: ['50', '55', '60', '65'],
    answer: '60',
  },

  {
    question: '2, 6, 12, 20, ?',
    options: ['28', '30', '32', '36'],
    answer: '30',
  },

  {
    question: '1, 2, 4, 8, ?',
    options: ['10', '12', '14', '16'],
    answer: '16',
  },

  {
    question: '20, 18, 16, 14, ?',
    options: ['10', '11', '12', '13'],
    answer: '12',
  },

  {
    question: '7, 14, 21, 28, ?',
    options: ['32', '34', '35', '36'],
    answer: '35',
  },

  {
    question: '1, 3, 6, 10, ?',
    options: ['12', '14', '15', '16'],
    answer: '15',
  },

  {
    question: '50, 45, 40, 35, ?',
    options: ['25', '28', '30', '32'],
    answer: '30',
  },

  {
    question: '4, 8, 16, 32, ?',
    options: ['48', '54', '64', '72'],
    answer: '64',
  },

  {
    question: '81, 27, 9, 3, ?',
    options: ['0', '1', '2', '6'],
    answer: '1',
  },

  {
    question: '11, 22, 33, 44, ?',
    options: ['50', '55', '66', '77'],
    answer: '55',
  },
];

export default function LogicRushScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedAnswer, setSelectedAnswer] =
    useState<string | null>(null);

  const [newAchievement, setNewAchievement] =
    useState<string | null>(null);

  const scoreRef = useRef(0);
  const questionRef = useRef(0);
  const gameEndedRef = useRef(false);

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const answerTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  // -----------------------------------------
  // SAVE SCORE
  // -----------------------------------------

  const saveScore = async (finalScore: number) => {
    try {
      setSaving(true);

      const token =
        await AsyncStorage.getItem('token');

      // Login nahi hai to score save nahi karenge
      if (!token) {
        console.log('No token found. Score not saved.');
        return;
      }

      const oldUserString =
        await AsyncStorage.getItem('user');

      let oldAchievements: string[] = [];

      if (oldUserString) {
        try {
          const oldUser = JSON.parse(oldUserString);

          oldAchievements =
            Array.isArray(oldUser.achievements)
              ? oldUser.achievements
              : [];
        } catch (error) {
          console.error(
            'OLD USER PARSE ERROR:',
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
            game: 'Logic Rush',
            score: finalScore,
          }),
        }
      );

      const data = await response.json();

      console.log(
        'Logic score response:',
        data
      );

      if (response.ok && data.user) {
        await AsyncStorage.setItem(
          'user',
          JSON.stringify(data.user)
        );

        const updatedAchievements =
          Array.isArray(data.user.achievements)
            ? data.user.achievements
            : [];

        const unlockedNow =
          updatedAchievements.find(
            (achievementId: string) =>
              !oldAchievements.includes(
                achievementId
              )
          );

        if (unlockedNow) {
          setNewAchievement(unlockedNow);
        }
      } else {
        console.log(
          'Score save failed:',
          data
        );
      }
    } catch (error) {
      console.error(
        'LOGIC SCORE ERROR:',
        error
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // END GAME
  // -----------------------------------------

  const endGame = async () => {
    if (gameEndedRef.current) {
      return;
    }

    gameEndedRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (answerTimeoutRef.current) {
      clearTimeout(answerTimeoutRef.current);
      answerTimeoutRef.current = null;
    }

    setGameOver(true);

    await saveScore(scoreRef.current);
  };

  // -----------------------------------------
  // START / RESTART GAME
  // -----------------------------------------

  const startGame = () => {
    // Clear old timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Clear old answer timeout
    if (answerTimeoutRef.current) {
      clearTimeout(answerTimeoutRef.current);
      answerTimeoutRef.current = null;
    }

    gameEndedRef.current = false;

    scoreRef.current = 0;
    questionRef.current = 0;

    setScore(0);
    setCurrentQuestion(0);
    setTimeLeft(30);
    setGameOver(false);
    setSaving(false);
    setSelectedAnswer(null);
    setNewAchievement(null);

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          // End game after timer reaches zero
          setTimeout(() => {
            endGame();
          }, 0);

          return 0;
        }

        return previousTime - 1;
      });
    }, 1000);
  };

  // -----------------------------------------
  // INITIAL GAME
  // -----------------------------------------

  useEffect(() => {
    startGame();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (answerTimeoutRef.current) {
        clearTimeout(answerTimeoutRef.current);
        answerTimeoutRef.current = null;
      }
    };
  }, []);

  // -----------------------------------------
  // ANSWER HANDLER
  // -----------------------------------------

  const handleAnswer = (answer: string) => {
    if (gameEndedRef.current) {
      return;
    }

    // Prevent multiple clicks
    if (selectedAnswer !== null) {
      return;
    }

    setSelectedAnswer(answer);

    const question =
      questions[questionRef.current];

    // Correct answer
    if (answer === question.answer) {
      const newScore =
        scoreRef.current + 10;

      scoreRef.current = newScore;
      setScore(newScore);
    }

    // Move to next question
    answerTimeoutRef.current = setTimeout(() => {
      answerTimeoutRef.current = null;

      if (gameEndedRef.current) {
        return;
      }

      if (
        questionRef.current >=
        questions.length - 1
      ) {
        endGame();
        return;
      }

      questionRef.current += 1;

      setCurrentQuestion(
        questionRef.current
      );

      setSelectedAnswer(null);
    }, 500);
  };

  // -----------------------------------------
  // CLOSE ACHIEVEMENT
  // -----------------------------------------

  const closeAchievement = () => {
    setNewAchievement(null);
  };

  // -----------------------------------------
  // CURRENT QUESTION
  // -----------------------------------------

  const question =
    questions[currentQuestion];

  // -----------------------------------------
  // GAME OVER SCREEN
  // -----------------------------------------

  if (gameOver) {
    return (
      <View style={styles.container}>
        {/* Achievement Popup */}

        {newAchievement &&
          achievementDetails[newAchievement] && (
            <View style={styles.popupOverlay}>
              <View style={styles.popupCard}>
                <Text style={styles.popupEmoji}>
                  🎉
                </Text>

                <Text style={styles.popupTitle}>
                  Achievement Unlocked!
                </Text>

                <View
                  style={styles.achievementIcon}
                >
                  <Text
                    style={
                      styles.achievementIconText
                    }
                  >
                    {
                      achievementDetails[
                        newAchievement
                      ].icon
                    }
                  </Text>
                </View>

                <Text
                  style={
                    styles.achievementTitle
                  }
                >
                  {
                    achievementDetails[
                      newAchievement
                    ].title
                  }
                </Text>

                <Text
                  style={
                    styles.achievementDescription
                  }
                >
                  {
                    achievementDetails[
                      newAchievement
                    ].description
                  }
                </Text>

                <Pressable
                  style={styles.popupButton}
                  onPress={
                    closeAchievement
                  }
                >
                  <Text
                    style={
                      styles.popupButtonText
                    }
                  >
                    AWESOME!
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

        <Text style={styles.gameOverEmoji}>
          🧩
        </Text>

        <Text style={styles.gameOverTitle}>
          Logic Complete!
        </Text>

        <Text style={styles.scoreLabel}>
          Your Score
        </Text>

        <Text style={styles.finalScore}>
          {score}
        </Text>

        <Text style={styles.xpText}>
          +{score} XP earned
        </Text>

        {saving && (
          <Text style={styles.savingText}>
            Saving score...
          </Text>
        )}

        {!newAchievement && (
          <>
            <Pressable
              style={styles.button}
              onPress={startGame}
            >
              <Text style={styles.buttonText}>
                PLAY AGAIN
              </Text>
            </Pressable>

            <Pressable
              style={styles.homeButton}
              onPress={() =>
                router.replace('/')
              }
            >
              <Text style={styles.homeText}>
                HOME
              </Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  // -----------------------------------------
  // GAME SCREEN
  // -----------------------------------------

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🧩 Logic Rush
      </Text>

      <View style={styles.infoRow}>
        <Text style={styles.timer}>
          ⏱️ {timeLeft}s
        </Text>

        <Text style={styles.score}>
          ⭐ {score}
        </Text>
      </View>

      <Text style={styles.progress}>
        Question {currentQuestion + 1} /{' '}
        {questions.length}
      </Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionLabel}>
          FIND THE PATTERN
        </Text>

        <Text style={styles.question}>
          {question.question}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {question.options.map(
          (option, index) => {
            const isSelected =
              selectedAnswer === option;

            const isCorrect =
              option === question.answer;

            let optionStyle =
              styles.option;

            if (isSelected) {
              optionStyle =
                isCorrect
                  ? styles.correctOption
                  : styles.wrongOption;
            }

            return (
              <Pressable
                key={`${currentQuestion}-${index}`}
                style={optionStyle}
                onPress={() =>
                  handleAnswer(option)
                }
                disabled={
                  selectedAnswer !== null
                }
              >
                <Text
                  style={
                    styles.optionNumber
                  }
                >
                  {String.fromCharCode(
                    65 + index
                  )}
                </Text>

                <Text
                  style={styles.optionText}
                >
                  {option}
                </Text>
              </Pressable>
            );
          }
        )}
      </View>
    </View>
  );
}

// -----------------------------------------
// STYLES
// -----------------------------------------

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
    marginBottom: 25,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  timer: {
    color: '#FBBF24',
    fontSize: 20,
    fontWeight: 'bold',
  },

  score: {
    color: '#818CF8',
    fontSize: 20,
    fontWeight: 'bold',
  },

  progress: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },

  questionCard: {
    backgroundColor: '#1F2937',
    borderRadius: 22,
    padding: 28,
    marginBottom: 25,
    alignItems: 'center',
  },

  questionLabel: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  question: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  optionsContainer: {
    gap: 12,
  },

  option: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },

  correctOption: {
    backgroundColor: '#14532D',
    borderRadius: 16,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22C55E',
  },

  wrongOption: {
    backgroundColor: '#7F1D1D',
    borderRadius: 16,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
  },

  optionNumber: {
    color: '#818CF8',
    fontSize: 17,
    fontWeight: 'bold',
    width: 35,
  },

  optionText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  gameOverEmoji: {
    fontSize: 65,
    textAlign: 'center',
    marginBottom: 15,
  },

  gameOverTitle: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  scoreLabel: {
    color: '#AAAAAA',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 25,
  },

  finalScore: {
    color: '#818CF8',
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  xpText: {
    color: '#22C55E',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  savingText: {
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 10,
  },

  button: {
    backgroundColor: '#4F46E5',
    padding: 17,
    borderRadius: 30,
    marginTop: 25,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  homeButton: {
    padding: 15,
    marginTop: 10,
  },

  homeText: {
    color: '#818CF8',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  popupCard: {
    width: '88%',
    backgroundColor: '#1F2937',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
  },

  popupEmoji: {
    fontSize: 55,
    marginBottom: 8,
  },

  popupTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  achievementIcon: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  achievementIconText: {
    fontSize: 42,
  },

  achievementTitle: {
    color: '#818CF8',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 15,
  },

  achievementDescription: {
    color: '#D1D5DB',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 7,
  },

  popupButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 30,
    marginTop: 25,
  },

  popupButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
