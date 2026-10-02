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

const questions = [
  {
    question: '7 + 8 = ?',
    options: ['13', '14', '15', '16'],
    answer: '15',
  },
  {
    question: '12 - 5 = ?',
    options: ['5', '6', '7', '8'],
    answer: '7',
  },
  {
    question: '6 × 4 = ?',
    options: ['20', '22', '24', '26'],
    answer: '24',
  },
  {
    question: '36 ÷ 6 = ?',
    options: ['4', '5', '6', '7'],
    answer: '6',
  },
  {
    question: '9 + 6 = ?',
    options: ['13', '14', '15', '16'],
    answer: '15',
  },
];

export default function DailyChallengeScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const [completed, setCompleted] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  const [saving, setSaving] = useState(false);
  const [rewardSaved, setRewardSaved] = useState(false);

  const [streak, setStreak] = useState(0);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const correctRef = useRef(0);
  const endedRef = useRef(false);

  const checkDailyStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        setCheckingStatus(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/game/daily-status`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log('DAILY STATUS:', data);

      setStreak(data.streak || 0);

      if (data.completed) {
        setAlreadyCompleted(true);
        setCompleted(true);
        endedRef.current = true;
      }
    } catch (error) {
      console.error('DAILY STATUS ERROR:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkDailyStatus();
  }, []);

  const completeChallenge = async () => {
    if (endedRef.current) {
      return;
    }

    endedRef.current = true;
    setCompleted(true);

    try {
      setSaving(true);

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/game/daily-complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log('DAILY RESULT:', data);

      if (response.status === 400) {
        setAlreadyCompleted(true);
        setStreak(data.streak || streak);
        return;
      }

      if (response.ok && data.user) {
        await AsyncStorage.setItem(
          'user',
          JSON.stringify(data.user)
        );

        setStreak(data.streak || data.user.streak || 1);
        setRewardSaved(true);
      }
    } catch (error) {
      console.error('DAILY ERROR:', error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (checkingStatus || alreadyCompleted) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          clearInterval(timer);

          completeChallenge();

          return 0;
        }

        return previousTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [checkingStatus, alreadyCompleted]);

  const handleAnswer = (selectedAnswer: string) => {
    if (endedRef.current) {
      return;
    }

    const question = questions[currentQuestion];

    if (selectedAnswer === question.answer) {
      const newCorrect = correctRef.current + 1;

      correctRef.current = newCorrect;
      setCorrectAnswers(newCorrect);
    }

    if (currentQuestion === questions.length - 1) {
      completeChallenge();
      return;
    }

    setCurrentQuestion(
      (previous) => previous + 1
    );
  };

  if (checkingStatus) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Checking Daily Challenge...
        </Text>
      </View>
    );
  }

  if (completed) {
    return (
      <View style={styles.container}>
        {alreadyCompleted ? (
          <>
            <Text style={styles.emoji}>🔥</Text>

            <Text style={styles.title}>
              Already Completed
            </Text>

            <Text style={styles.result}>
              Today's challenge is already done.
            </Text>

            <View style={styles.streakCard}>
              <Text style={styles.streakIcon}>
                🔥
              </Text>

              <Text style={styles.streakTitle}>
                Current Streak
              </Text>

              <Text style={styles.streakNumber}>
                {streak} Day{streak !== 1 ? 's' : ''}
              </Text>
            </View>

            <Text style={styles.tomorrow}>
              Come back tomorrow! 🎯
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.emoji}>🎉</Text>

            <Text style={styles.title}>
              Challenge Complete!
            </Text>

            <Text style={styles.result}>
              {correctAnswers} / 5 Correct
            </Text>

            <View style={styles.rewardCard}>
              <Text style={styles.rewardIcon}>
                🎁
              </Text>

              <Text style={styles.rewardTitle}>
                Daily Reward
              </Text>

              <Text style={styles.rewardXP}>
                +50 XP
              </Text>
            </View>

            <View style={styles.streakCard}>
              <Text style={styles.streakIcon}>
                🔥
              </Text>

              <Text style={styles.streakTitle}>
                Current Streak
              </Text>

              <Text style={styles.streakNumber}>
                {streak} Day{streak !== 1 ? 's' : ''}
              </Text>
            </View>

            {saving && (
              <Text style={styles.savingText}>
                Saving reward...
              </Text>
            )}

            {rewardSaved && (
              <Text style={styles.successText}>
                ✓ 50 XP added • Streak updated 🔥
              </Text>
            )}
          </>
        )}

        <Pressable
          style={styles.button}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.buttonText}>
            BACK TO HOME
          </Text>
        </Pressable>
      </View>
    );
  }

  const question = questions[currentQuestion];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🧩 Daily Challenge
      </Text>

      <Text style={styles.subtitle}>
        Complete all 5 questions
      </Text>

      <View style={styles.topStreak}>
        <Text style={styles.topStreakText}>
          🔥 Streak: {streak} Day
          {streak !== 1 ? 's' : ''}
        </Text>
      </View>

      <Text style={styles.timer}>
        ⏱️ {timeLeft}s
      </Text>

      <Text style={styles.progress}>
        Question {currentQuestion + 1} / 5
      </Text>

      <Text style={styles.question}>
        {question.question}
      </Text>

      <View style={styles.options}>
        {question.options.map((option) => (
          <Pressable
            key={option}
            style={styles.option}
            onPress={() => handleAnswer(option)}
          >
            <Text style={styles.optionText}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
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
    textAlign: 'center',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 15,
  },

  topStreak: {
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 15,
    alignSelf: 'center',
    marginBottom: 15,
  },

  topStreakText: {
    color: '#F97316',
    fontSize: 17,
    fontWeight: 'bold',
  },

  timer: {
    color: '#FBBF24',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  progress: {
    color: '#818CF8',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },

  question: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 35,
  },

  options: {
    gap: 15,
  },

  option: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },

  optionText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  emoji: {
    fontSize: 65,
    textAlign: 'center',
    marginBottom: 15,
  },

  result: {
    color: '#818CF8',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },

  rewardCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginTop: 25,
  },

  rewardIcon: {
    fontSize: 40,
  },

  rewardTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },

  rewardXP: {
    color: '#22C55E',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 5,
  },

  streakCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },

  streakIcon: {
    fontSize: 35,
  },

  streakTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },

  streakNumber: {
    color: '#F97316',
    fontSize: 27,
    fontWeight: 'bold',
    marginTop: 5,
  },

  tomorrow: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },

  savingText: {
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 15,
  },

  successText: {
    color: '#22C55E',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
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
});