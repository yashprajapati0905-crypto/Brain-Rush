import { router } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type GameCardProps = {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress?: () => void;
  comingSoon?: boolean;
};

function GameCard({
  icon,
  title,
  subtitle,
  color,
  onPress,
  comingSoon = false,
}: GameCardProps) {
  return (
    <Pressable
      style={[
        styles.gameCard,
        comingSoon && styles.comingSoonCard,
      ]}
      onPress={onPress}
      disabled={comingSoon}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: color },
        ]}
      >
        <Text style={styles.gameIcon}>
          {icon}
        </Text>
      </View>

      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle}>
          {title}
        </Text>

        <Text style={styles.gameSubtitle}>
          {subtitle}
        </Text>

        {comingSoon && (
          <Text style={styles.comingSoon}>
            COMING SOON
          </Text>
        )}
      </View>

      {!comingSoon && (
        <Text style={styles.arrow}>
          ›
        </Text>
      )}
    </Pressable>
  );
}

export default function CategoriesScreen() {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.smallTitle}>
            BRAIN RUSH
          </Text>

          <Text style={styles.title}>
            Choose Your Challenge 🧠
          </Text>
        </View>

        <Pressable
          style={styles.profileButton}
          onPress={() =>
            router.replace('/profile')
          }
        >
          <Text style={styles.profileIcon}>
            👤
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* ACTIVE GAMES */}
        <Text style={styles.sectionTitle}>
          Play Now
        </Text>

        <GameCard
          icon="➗"
          title="Math Rush"
          subtitle="Solve calculations before time runs out"
          color="#4F46E5"
          onPress={() =>
            router.push('/math')
          }
        />

        <GameCard
          icon="🧠"
          title="Memory Rush"
          subtitle="Match the cards and test your memory"
          color="#7C3AED"
          onPress={() =>
            router.push('/memory')
          }
        />

        <GameCard
          icon="🧩"
          title="Logic Rush"
          subtitle="Find the correct pattern and answer"
          color="#0891B2"
          onPress={() =>
            router.push('/logic')
          }
        />

        {/* COMING SOON */}
        <Text
          style={[
            styles.sectionTitle,
            styles.comingSoonSection,
          ]}
        >
          More Challenges
        </Text>

        <GameCard
          icon="⚡"
          title="Reaction Rush"
          subtitle="Test your speed and reaction time"
          color="#374151"
          comingSoon
        />

        <GameCard
          icon="🎨"
          title="Color Rush"
          subtitle="Test your focus and color recognition"
          color="#374151"
          comingSoon
        />

        {/* DAILY CHALLENGE */}
        <Text
          style={[
            styles.sectionTitle,
            styles.dailySection,
          ]}
        >
          Special Challenge
        </Text>

        <Pressable
          style={styles.dailyCard}
          onPress={() =>
            router.push('/daily')
          }
        >
          <View style={styles.dailyIconBox}>
            <Text style={styles.dailyIcon}>
              🎯
            </Text>
          </View>

          <View style={styles.dailyInfo}>
            <Text style={styles.dailyTitle}>
              Daily Challenge
            </Text>

            <Text style={styles.dailySubtitle}>
              Complete today's challenge
            </Text>

            <Text style={styles.dailyReward}>
              🎁 Reward: +50 XP
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </Pressable>

        {/* BOTTOM NAV */}
        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navButton}
            onPress={() =>
              router.replace('/')
            }
          >
            <Text style={styles.navIcon}>
              🏠
            </Text>

            <Text style={styles.navText}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.navButton,
              styles.activeNavButton,
            ]}
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
            onPress={() =>
              router.replace('/leaderboard')
            }
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
            onPress={() =>
              router.replace('/profile')
            }
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

  header: {
    marginTop: 40,
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallTitle: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
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
    fontSize: 24,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  gameCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 17,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  comingSoonCard: {
    opacity: 0.65,
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  gameIcon: {
    fontSize: 30,
  },

  gameInfo: {
    flex: 1,
    marginLeft: 14,
  },

  gameTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  gameSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  comingSoon: {
    color: '#818CF8',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 6,
  },

  arrow: {
    color: '#ffffff',
    fontSize: 32,
    marginLeft: 8,
  },

  comingSoonSection: {
    marginTop: 15,
  },

  dailySection: {
    marginTop: 15,
  },

  dailyCard: {
    backgroundColor: '#252A48',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },

  dailyIconBox: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: '#312E81',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dailyIcon: {
    fontSize: 28,
  },

  dailyInfo: {
    flex: 1,
    marginLeft: 13,
  },

  dailyTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  dailySubtitle: {
    color: '#A5B4FC',
    fontSize: 12,
    marginTop: 4,
  },

  dailyReward: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 7,
  },

  bottomNav: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginTop: 25,
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