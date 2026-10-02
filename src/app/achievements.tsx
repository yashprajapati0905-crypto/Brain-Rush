import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type Achievement = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

const achievements: Achievement[] = [
  {
    id: 'first_game',
    icon: '🥇',
    title: 'First Game',
    description: 'You completed your first game!',
  },
  {
    id: 'high_scorer',
    icon: '🎯',
    title: 'High Scorer',
    description: 'You scored 50 or more!',
  },
  {
    id: 'streak_3',
    icon: '🔥',
    title: '3 Day Streak',
    description: 'You reached a 3-day streak!',
  },
  {
    id: 'streak_7',
    icon: '🔥',
    title: '7 Day Streak',
    description: 'You reached a 7-day streak!',
  },
  {
    id: 'xp_hunter',
    icon: '⚡',
    title: 'XP Hunter',
    description: 'You earned 500 XP!',
  },
  {
    id: 'brain_master',
    icon: '🧠',
    title: 'Brain Master',
    description: 'You completed 20 games!',
  },
];

export default function AchievementsScreen() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(
    []
  );

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');

      if (userData) {
        const user = JSON.parse(userData);

        setUnlockedAchievements(user.achievements || []);
      }
    } catch (error) {
      console.log('Error loading achievements:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>🏆 Achievements</Text>

        <View style={styles.headerSpace} />
      </View>

      <Text style={styles.subtitle}>
        Complete challenges and unlock achievements!
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {achievements.map((achievement) => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);

          return (
            <View
              key={achievement.id}
              style={[
                styles.card,
                isUnlocked
                  ? styles.unlockedCard
                  : styles.lockedCard,
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  !isUnlocked && styles.lockedIconBox,
                ]}
              >
                <Text style={styles.icon}>
                  {isUnlocked ? achievement.icon : '🔒'}
                </Text>
              </View>

              <View style={styles.info}>
                <Text style={styles.title}>
                  {achievement.title}
                </Text>

                <Text style={styles.description}>
                  {achievement.description}
                </Text>

                <Text
                  style={[
                    styles.status,
                    isUnlocked
                      ? styles.unlockedStatus
                      : styles.lockedStatus,
                  ]}
                >
                  {isUnlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
                </Text>
              </View>
            </View>
          );
        })}

        <Pressable
          style={styles.homeButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.homeButtonText}>🏠 Back to Home</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101828',
    paddingTop: 55,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1D2939',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 28,
    marginTop: -3,
  },

  headerSpace: {
    width: 42,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#98A2B3',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  list: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },

  unlockedCard: {
    backgroundColor: '#172554',
    borderColor: '#2563EB',
  },

  lockedCard: {
    backgroundColor: '#171717',
    borderColor: '#344054',
    opacity: 0.7,
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  lockedIconBox: {
    backgroundColor: '#344054',
  },

  icon: {
    fontSize: 30,
  },

  info: {
    flex: 1,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  description: {
    color: '#98A2B3',
    fontSize: 13,
    lineHeight: 19,
  },

  status: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 7,
  },

  unlockedStatus: {
    color: '#4ADE80',
  },

  lockedStatus: {
    color: '#98A2B3',
  },

  homeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },

  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});