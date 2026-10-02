
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const API_URL = 'https://brain-rush-backend.onrender.com';

type User = {
  name: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  bestScore: number;
  gamesPlayed: number;
  achievements: string[];
};

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        router.replace('/login');
        return;
      }

      const userResponse = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        router.replace('/login');
        return;
      }

      const userData = await userResponse.json();

      setUser(userData.user);

      await AsyncStorage.setItem(
        'user',
        JSON.stringify(userData.user)
      );

      const dailyResponse = await fetch(
        `${API_URL}/api/game/daily-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (dailyResponse.ok) {
        const dailyData = await dailyResponse.json();
        setDailyCompleted(dailyData.completed);
      }
    } catch (error) {
      console.log('Home loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLogo}>🧠</Text>

        <Text style={styles.loadingText}>
          Brain Rush
        </Text>

        <ActivityIndicator
          size="small"
          color="#818CF8"
          style={{ marginTop: 15 }}
        />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  const xpInLevel = user.xp % 500;
  const xpProgress = Math.min(xpInLevel / 500, 1);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>
              WELCOME BACK 👋
            </Text>

            <Text style={styles.name}>
              {user.name}
            </Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </Pressable>
        </View>

        {/* LEVEL CARD */}
        <View style={styles.levelCard}>
          <View style={styles.levelTop}>
            <View>
              <Text style={styles.levelLabel}>
                CURRENT LEVEL
              </Text>

              <Text style={styles.levelNumber}>
                Level {user.level}
              </Text>
            </View>

            <Text style={styles.xpText}>
              {xpInLevel} / 500 XP
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${xpProgress * 100}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.totalXp}>
            {user.xp} TOTAL XP
          </Text>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>

            <Text style={styles.statValue}>
              {user.streak}
            </Text>

            <Text style={styles.statLabel}>
              Day Streak
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>

            <Text style={styles.statValue}>
              {user.bestScore}
            </Text>

            <Text style={styles.statLabel}>
              Best Score
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎮</Text>

            <Text style={styles.statValue}>
              {user.gamesPlayed}
            </Text>

            <Text style={styles.statLabel}>
              Games
            </Text>
          </View>
        </View>

        {/* LEADERBOARD */}
        <Pressable
          style={styles.leaderboardCard}
          onPress={() => router.push('/leaderboard')}
        >
          <View style={styles.leaderboardIcon}>
            <Text style={styles.leaderboardEmoji}>
              🏆
            </Text>
          </View>

          <View style={styles.leaderboardInfo}>
            <Text style={styles.leaderboardTitle}>
              Leaderboard
            </Text>

            <Text style={styles.leaderboardSubtitle}>
              See top Brain Rush players
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* ACHIEVEMENTS */}
        <Pressable
          style={styles.achievementCard}
          onPress={() => router.push('/profile')}
        >
          <View>
            <Text style={styles.achievementTitle}>
              🏅 Achievements
            </Text>

            <Text style={styles.achievementSubtitle}>
              {user.achievements?.length || 0}/6 unlocked
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* DAILY CHALLENGE */}
        <Pressable
          style={styles.dailyCard}
          onPress={() => router.push('/daily')}
        >
          <View style={styles.dailyLeft}>
            <Text style={styles.dailyEmoji}>
              🎯
            </Text>

            <View>
              <Text style={styles.dailyTitle}>
                Daily Challenge
              </Text>

              <Text style={styles.dailySubtitle}>
                {dailyCompleted
                  ? 'Completed today ✓'
                  : 'Complete today and earn +50 XP'}
              </Text>
            </View>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* QUICK PLAY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Quick Play
          </Text>

          <Pressable
            onPress={() => router.push('/categories')}
          >
            <Text style={styles.seeAll}>
              See All
            </Text>
          </Pressable>
        </View>

        <View style={styles.quickRow}>
          {/* MATH */}
          <Pressable
            style={styles.quickCard}
            onPress={() => router.push('/math')}
          >
            <Text style={styles.quickIcon}>➗</Text>

            <Text style={styles.quickTitle}>
              Math
            </Text>

            <Text style={styles.quickSubtitle}>
              Rush
            </Text>
          </Pressable>

          {/* MEMORY */}
          <Pressable
            style={styles.quickCard}
            onPress={() => router.push('/memory')}
          >
            <Text style={styles.quickIcon}>🧠</Text>

            <Text style={styles.quickTitle}>
              Memory
            </Text>

            <Text style={styles.quickSubtitle}>
              Rush
            </Text>
          </Pressable>

          {/* LOGIC */}
          <Pressable
            style={styles.quickCard}
            onPress={() => router.push('/logic')}
          >
            <Text style={styles.quickIcon}>🧩</Text>

            <Text style={styles.quickTitle}>
              Logic
            </Text>

            <Text style={styles.quickSubtitle}>
              Rush
            </Text>
          </Pressable>
        </View>

        {/* MORE CHALLENGES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            More Challenges
          </Text>
        </View>

        {/* REACTION RUSH */}
        <Link href="/reaction" asChild>
          <Pressable style={styles.challengeCard}>
            <View style={styles.challengeIconBox}>
              <Text style={styles.challengeIcon}>
                ⚡
              </Text>
            </View>

            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>
                Reaction Rush
              </Text>

              <Text style={styles.challengeSubtitle}>
                Test your speed and reaction time
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </Pressable>
        </Link>

        {/* COLOR RUSH */}
        <Link href="/color" asChild>
          <Pressable style={styles.challengeCard}>
            <View style={styles.challengeIconBox}>
              <Text style={styles.challengeIcon}>
                🎨
              </Text>
            </View>

            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>
                Color Rush
              </Text>

              <Text style={styles.challengeSubtitle}>
                Test your focus and color recognition
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </Pressable>
        </Link>

        {/* SPEED TAP RUSH */}
        <Link href="/speed" asChild>
          <Pressable style={styles.challengeCard}>
            <View style={styles.challengeIconBox}>
              <Text style={styles.challengeIcon}>
                🎯
              </Text>
            </View>

            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>
                Speed Tap Rush
              </Text>

              <Text style={styles.challengeSubtitle}>
                Test your reaction speed
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </Pressable>
        </Link>

        {/* PLAY NOW */}
        <Pressable
          style={styles.playButton}
          onPress={() => router.push('/categories')}
        >
          <Text style={styles.playButtonText}>
            🎮 PLAY NOW
          </Text>

          <Text style={styles.playButtonArrow}>
            →
          </Text>
        </Pressable>

        {/* BOTTOM NAV */}
        <View style={styles.bottomNav}>
          <Pressable
            style={[
              styles.navButton,
              styles.activeNavButton,
            ]}
          >
            <Text style={styles.navIcon}>
              🏠
            </Text>

            <Text style={styles.navText}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.navButton}
            onPress={() => router.push('/categories')}
          >
            <Text style={styles.navIcon}>
              🎮
            </Text>

            <Text style={styles.navText}>
              Play
            </Text>
          </Pressable>

          <Pressable
            style={styles.navButton}
            onPress={() => router.push('/leaderboard')}
          >
            <Text style={styles.navIcon}>
              🏆
            </Text>

            <Text style={styles.navText}>
              Rankings
            </Text>
          </Pressable>

          <Pressable
            style={styles.navButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.navIcon}>
              👤
            </Text>

            <Text style={styles.navText}>
              Profile
            </Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101828',
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#101828',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingLogo: {
    fontSize: 55,
  },

  loadingText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },

  header: {
    marginTop: 40,
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  welcome: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  name: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileIcon: {
    fontSize: 23,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  levelCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },

  levelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  levelLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  levelNumber: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },

  xpText: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: 'bold',
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 10,
    marginTop: 18,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 10,
  },

  totalXp: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 8,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  statCard: {
    width: '31.5%',
    backgroundColor: '#1F2937',
    borderRadius: 17,
    paddingVertical: 15,
    alignItems: 'center',
  },

  statIcon: {
    fontSize: 20,
  },

  statValue: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 5,
  },

  statLabel: {
    color: '#9CA3AF',
    fontSize: 9,
    marginTop: 3,
  },

  leaderboardCard: {
    backgroundColor: '#1F2937',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  leaderboardIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#312E81',
    justifyContent: 'center',
    alignItems: 'center',
  },

  leaderboardEmoji: {
    fontSize: 25,
  },

  leaderboardInfo: {
    flex: 1,
    marginLeft: 13,
  },

  leaderboardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  leaderboardSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
  },

  achievementCard: {
    backgroundColor: '#1F2937',
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  achievementTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  achievementSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
  },

  dailyCard: {
    backgroundColor: '#252A48',
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },

  dailyLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dailyEmoji: {
    fontSize: 28,
    marginRight: 12,
  },

  dailyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  dailySubtitle: {
    color: '#A5B4FC',
    fontSize: 11,
    marginTop: 4,
  },

  arrow: {
    color: '#ffffff',
    fontSize: 30,
    marginLeft: 8,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  seeAll: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: 'bold',
  },

  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  quickCard: {
    width: '31.5%',
    backgroundColor: '#1F2937',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
  },

  quickIcon: {
    fontSize: 27,
  },

  quickTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },

  quickSubtitle: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 2,
  },

  challengeCard: {
    backgroundColor: '#1F2937',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },

  challengeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#312E81',
    justifyContent: 'center',
    alignItems: 'center',
  },

  challengeIcon: {
    fontSize: 25,
  },

  challengeInfo: {
    flex: 1,
    marginLeft: 13,
  },

  challengeTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  challengeSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
  },

  playButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  playButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  playButtonArrow: {
    color: '#ffffff',
    fontSize: 23,
    marginLeft: 10,
  },

  bottomNav: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#374151',
  },

  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 14,
  },

  activeNavButton: {
    backgroundColor: '#312E81',
  },

  navIcon: {
    fontSize: 19,
  },

  navText: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 3,
  },

  bottomSpace: {
    height: 20,
  },
});
