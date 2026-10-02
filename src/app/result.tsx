import { router, useLocalSearchParams } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function ResultScreen() {
  const params = useLocalSearchParams();

  const game = String(params.game || 'Game');
  const score = Number(params.score || 0);
  const xp = Number(params.xp || score);
  const bestScore = Number(params.bestScore || score);
  const streak = Number(params.streak || 0);
  const achievement = String(params.achievement || '');

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <Text style={styles.trophy}>🏆</Text>

        <Text style={styles.resultTitle}>
          Great Job!
        </Text>

        <Text style={styles.gameName}>
          {game} Complete
        </Text>

        {/* SCORE */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>
            YOUR SCORE
          </Text>

          <Text style={styles.score}>
            {score}
          </Text>

          <Text style={styles.scoreMessage}>
            {score >= 80
              ? '🔥 Amazing performance!'
              : score >= 50
              ? '👏 Great performance!'
              : score >= 20
              ? '💪 Keep improving!'
              : '🚀 Try again and beat your score!'}
          </Text>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>

            <Text style={styles.statValue}>
              +{xp}
            </Text>

            <Text style={styles.statLabel}>
              XP Earned
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>

            <Text style={styles.statValue}>
              {bestScore}
            </Text>

            <Text style={styles.statLabel}>
              Best Score
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>

            <Text style={styles.statValue}>
              {streak}
            </Text>

            <Text style={styles.statLabel}>
              Streak
            </Text>
          </View>
        </View>

        {/* ACHIEVEMENT */}
        {achievement !== '' && (
          <View style={styles.achievementCard}>
            <Text style={styles.achievementEmoji}>
              🏅
            </Text>

            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>
                Achievement Unlocked!
              </Text>

              <Text style={styles.achievementText}>
                {achievement}
              </Text>
            </View>
          </View>
        )}

        {/* ACTIONS */}
        <Pressable
          style={styles.playAgainButton}
          onPress={() => {
            if (game === 'Math Rush') {
              router.replace('/math');
            } else if (game === 'Memory Rush') {
              router.replace('/memory');
            } else if (game === 'Logic Rush') {
              router.replace('/logic');
            } else {
              router.replace('/categories');
            }
          }}
        >
          <Text style={styles.playAgainText}>
            🔄 PLAY AGAIN
          </Text>
        </Pressable>

        <Pressable
          style={styles.homeButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.homeButtonText}>
            🏠 BACK TO HOME
          </Text>
        </Pressable>

        <Pressable
          style={styles.categoriesButton}
          onPress={() =>
            router.replace('/categories')
          }
        >
          <Text style={styles.categoriesText}>
            🎮 MORE GAMES
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101828',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
  },

  trophy: {
    fontSize: 65,
    marginBottom: 10,
  },

  resultTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
  },

  gameName: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 6,
  },

  scoreCard: {
    width: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 24,
    paddingVertical: 25,
    alignItems: 'center',
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#374151',
  },

  scoreLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  score: {
    color: '#818CF8',
    fontSize: 58,
    fontWeight: 'bold',
    marginTop: 5,
  },

  scoreMessage: {
    color: '#D1D5DB',
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },

  statsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  statCard: {
    width: '31.5%',
    backgroundColor: '#1F2937',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },

  statIcon: {
    fontSize: 21,
  },

  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },

  statLabel: {
    color: '#9CA3AF',
    fontSize: 9,
    marginTop: 3,
    textAlign: 'center',
  },

  achievementCard: {
    width: '100%',
    backgroundColor: '#252A48',
    borderRadius: 18,
    padding: 17,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },

  achievementEmoji: {
    fontSize: 32,
  },

  achievementInfo: {
    flex: 1,
    marginLeft: 12,
  },

  achievementTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  achievementText: {
    color: '#A5B4FC',
    fontSize: 12,
    marginTop: 4,
  },

  playAgainButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 25,
  },

  playAgainText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  homeButton: {
    width: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },

  homeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  categoriesButton: {
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 5,
  },

  categoriesText: {
    color: '#818CF8',
    fontSize: 13,
    fontWeight: 'bold',
  },
});