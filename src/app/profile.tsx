
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const API_URL = 'http://localhost:5000';

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

const achievementList = [
  {
    id: 'first_game',
    icon: '🥇',
    title: 'First Game',
    description: 'Complete your first game',
  },
  {
    id: 'high_scorer',
    icon: '🎯',
    title: 'High Scorer',
    description: 'Score 50 or more points',
  },
  {
    id: 'streak_3',
    icon: '🔥',
    title: '3 Day Streak',
    description: 'Maintain a 3-day streak',
  },
  {
    id: 'streak_7',
    icon: '🔥',
    title: '7 Day Streak',
    description: 'Maintain a 7-day streak',
  },
  {
    id: 'xp_hunter',
    icon: '⚡',
    title: 'XP Hunter',
    description: 'Earn 500 XP',
  },
  {
    id: 'brain_master',
    icon: '🧠',
    title: 'Brain Master',
    description: 'Complete 20 games',
  },
];

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/auth/me`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');

        router.replace('/login');
        return;
      }

      setUser(data.user);

      await AsyncStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );
    } catch (error) {
      console.error('PROFILE ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');

    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Loading Profile...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          User not found
        </Text>
      </View>
    );
  }

  const currentLevelXP = user.xp % 500;
  const xpPercentage = Math.min(
    (currentLevelXP / 500) * 100,
    100
  );

  const unlockedCount = achievementList.filter(
    (achievement) =>
      user.achievements?.includes(achievement.id)
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          Profile
        </Text>

        <View style={styles.headerSpace} />
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>
          {user.name}
        </Text>

        <Text style={styles.email}>
          {user.email}
        </Text>

        <Text style={styles.playerText}>
          🧠 Brain Rush Player
        </Text>
      </View>

      {/* Level */}
      <View style={styles.levelCard}>
        <View style={styles.levelRow}>
          <View>
            <Text style={styles.smallLabel}>
              CURRENT LEVEL
            </Text>

            <Text style={styles.level}>
              Level {user.level}
            </Text>
          </View>

          <Text style={styles.xpText}>
            {currentLevelXP} / 500 XP
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${xpPercentage}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⚡</Text>
          <Text style={styles.statValue}>
            {user.xp}
          </Text>
          <Text style={styles.statLabel}>
            Total XP
          </Text>
        </View>

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
          <Text style={styles.statIcon}>🏆</Text>
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
            Games Played
          </Text>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            🏆 Achievements
          </Text>

          <Text style={styles.sectionSubtitle}>
            {unlockedCount} / {achievementList.length} unlocked
          </Text>
        </View>
      </View>

      <View style={styles.achievementList}>
        {achievementList.map((achievement) => {
          const unlocked =
            user.achievements?.includes(
              achievement.id
            );

          return (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                unlocked
                  ? styles.unlockedCard
                  : styles.lockedCard,
              ]}
            >
              <View
                style={[
                  styles.achievementIcon,
                  !unlocked &&
                    styles.lockedIcon,
                ]}
              >
                <Text style={styles.iconText}>
                  {unlocked
                    ? achievement.icon
                    : '🔒'}
                </Text>
              </View>

              <View style={styles.achievementInfo}>
                <Text
                  style={[
                    styles.achievementTitle,
                    !unlocked &&
                      styles.lockedText,
                  ]}
                >
                  {achievement.title}
                </Text>

                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
              </View>

              {unlocked && (
                <Text style={styles.unlockedText}>
                  ✓
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Logout */}
      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          LOGOUT
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101828',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#101828',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#ffffff',
    fontSize: 18,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    color: '#ffffff',
    fontSize: 28,
  },

  headerTitle: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: 'bold',
  },

  headerSpace: {
    width: 45,
  },

  profileCard: {
    backgroundColor: '#1F2937',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
  },

  avatar: {
    width: 85,
    height: 85,
    borderRadius: 42,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  avatarText: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: 'bold',
  },

  name: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: 'bold',
  },

  email: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 5,
  },

  playerText: {
    color: '#818CF8',
    fontSize: 15,
    marginTop: 12,
    fontWeight: 'bold',
  },

  levelCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },

  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  level: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },

  xpText: {
    color: '#818CF8',
    fontSize: 14,
    fontWeight: 'bold',
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#374151',
    borderRadius: 10,
    marginTop: 15,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 10,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  statCard: {
    backgroundColor: '#1F2937',
    width: '48%',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
  },

  statIcon: {
    fontSize: 27,
  },

  statValue: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: 'bold',
    marginTop: 7,
  },

  statLabel: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 3,
  },

  sectionHeader: {
    marginTop: 15,
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: 'bold',
  },

  sectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },

  achievementList: {
    gap: 12,
  },

  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 15,
  },

  unlockedCard: {
    backgroundColor: '#1F2937',
  },

  lockedCard: {
    backgroundColor: '#161F2D',
    opacity: 0.75,
  },

  achievementIcon: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },

  lockedIcon: {
    backgroundColor: '#252E3B',
  },

  iconText: {
    fontSize: 27,
  },

  achievementInfo: {
    flex: 1,
    marginLeft: 14,
  },

  achievementTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  lockedText: {
    color: '#9CA3AF',
  },

  achievementDescription: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 4,
  },

  unlockedText: {
    color: '#22C55E',
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  logoutButton: {
    backgroundColor: '#DC2626',
    padding: 17,
    borderRadius: 30,
    marginTop: 25,
  },

  logoutText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});