import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const API_URL = 'http://localhost:5000';

type Player = {
  rank: number;
  id: string;
  name: string;
  xp: number;
  level: number;
  bestScore: number;
  gamesPlayed: number;
};

export default function LeaderboardScreen() {
  const [players, setPlayers] = useState<Player[]>(
    []
  );

  const [currentUser, setCurrentUser] =
    useState<Player | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const loadLeaderboard = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const token =
        await AsyncStorage.getItem('token');

      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/game/leaderboard`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          'Leaderboard Error:',
          data
        );
        return;
      }

      setPlayers(data.leaderboard || []);
      setCurrentUser(
        data.currentUser || null
      );
    } catch (error) {
      console.error(
        'LOAD LEADERBOARD ERROR:',
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLeaderboard();
    }, [])
  );

  const getRankEmoji = (
    rank: number
  ) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';

    return `#${rank}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#818CF8"
        />

        <Text style={styles.loadingText}>
          Loading Leaderboard...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            🏆 Leaderboard
          </Text>

          <Text style={styles.subtitle}>
            Top Brain Rush Players
          </Text>
        </View>

        <Pressable
          style={styles.refreshButton}
          onPress={() =>
            loadLeaderboard(false)
          }
          disabled={refreshing}
        >
          <Text style={styles.refreshText}>
            🔄
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* TOP 3 */}
        {players.length > 0 && (
          <View style={styles.topThree}>
            {players
              .slice(0, 3)
              .map((player) => (
                <View
                  key={player.id}
                  style={[
                    styles.topPlayer,
                    player.rank === 1 &&
                      styles.firstPlayer,
                  ]}
                >
                  <Text
                    style={styles.rankEmoji}
                  >
                    {getRankEmoji(
                      player.rank
                    )}
                  </Text>

                  <View style={styles.avatar}>
                    <Text
                      style={
                        styles.avatarText
                      }
                    >
                      {player.name
                        ?.charAt(0)
                        .toUpperCase() ||
                        'P'}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.topPlayerName
                    }
                    numberOfLines={1}
                  >
                    {player.name}
                  </Text>

                  <Text style={styles.topXP}>
                    {player.xp} XP
                  </Text>

                  <Text
                    style={styles.topLevel}
                  >
                    Level {player.level}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* YOUR RANK */}
        {currentUser && (
          <View style={styles.yourRankCard}>
            <View>
              <Text
                style={
                  styles.yourRankLabel
                }
              >
                YOUR RANK
              </Text>

              <Text
                style={
                  styles.yourRankNumber
                }
              >
                #{currentUser.rank}
              </Text>
            </View>

            <View
              style={
                styles.yourRankRight
              }
            >
              <Text
                style={
                  styles.yourRankName
                }
              >
                {currentUser.name}
              </Text>

              <Text
                style={
                  styles.yourRankXP
                }
              >
                {currentUser.xp} XP
              </Text>
            </View>
          </View>
        )}

        {/* PLAYER LIST */}
        <Text style={styles.sectionTitle}>
          Rankings
        </Text>

        {players.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text
              style={styles.emptyEmoji}
            >
              🧠
            </Text>

            <Text
              style={styles.emptyTitle}
            >
              No players yet
            </Text>

            <Text
              style={styles.emptyText}
            >
              Play a game to appear on
              the leaderboard.
            </Text>
          </View>
        ) : (
          players.map((player) => {
            const isCurrentUser =
              currentUser?.id ===
              player.id;

            return (
              <View
                key={player.id}
                style={[
                  styles.playerCard,
                  isCurrentUser &&
                    styles.currentUserCard,
                ]}
              >
                <View
                  style={styles.rankContainer}
                >
                  <Text
                    style={[
                      styles.rank,
                      player.rank <= 3 &&
                        styles.topRank,
                    ]}
                  >
                    {getRankEmoji(
                      player.rank
                    )}
                  </Text>
                </View>

                <View
                  style={styles.playerAvatar}
                >
                  <Text
                    style={
                      styles.playerAvatarText
                    }
                  >
                    {player.name
                      ?.charAt(0)
                      .toUpperCase() ||
                      'P'}
                  </Text>
                </View>

                <View
                  style={
                    styles.playerInfo
                  }
                >
                  <View
                    style={styles.nameRow}
                  >
                    <Text
                      style={
                        styles.playerName
                      }
                      numberOfLines={1}
                    >
                      {player.name}
                    </Text>

                    {isCurrentUser && (
                      <Text
                        style={
                          styles.youBadge
                        }
                      >
                        YOU
                      </Text>
                    )}
                  </View>

                  <Text
                    style={
                      styles.playerLevel
                    }
                  >
                    Level {player.level}
                    {'  '}•{'  '}
                    {player.gamesPlayed}{' '}
                    games
                  </Text>
                </View>

                <View
                  style={
                    styles.playerScore
                  }
                >
                  <Text
                    style={
                      styles.playerXP
                    }
                  >
                    {player.xp}
                  </Text>

                  <Text
                    style={styles.xpLabel}
                  >
                    XP
                  </Text>
                </View>
              </View>
            );
          })
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
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
          onPress={() =>
            router.replace('/leaderboard')
          }
        >
          <Text style={styles.navIcon}>
            🏆
          </Text>

          <Text style={styles.navText}>
            Leaderboard
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

  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },

  header: {
    marginTop: 40,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 3,
  },

  refreshButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },

  refreshText: {
    fontSize: 21,
  },

  topThree: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  topPlayer: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
  },

  firstPlayer: {
    backgroundColor: '#252A48',
    borderWidth: 1,
    borderColor: '#818CF8',
  },

  rankEmoji: {
    fontSize: 25,
    marginBottom: 7,
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  topPlayerName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 9,
  },

  topXP: {
    color: '#818CF8',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 5,
  },

  topLevel: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 3,
  },

  yourRankCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  yourRankLabel: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: 'bold',
  },

  yourRankNumber: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 3,
  },

  yourRankRight: {
    alignItems: 'flex-end',
  },

  yourRankName: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  yourRankXP: {
    color: '#C7D2FE',
    fontSize: 13,
    marginTop: 3,
  },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  playerCard: {
    backgroundColor: '#1F2937',
    borderRadius: 17,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  currentUserCard: {
    borderWidth: 1,
    borderColor: '#818CF8',
  },

  rankContainer: {
    width: 40,
    alignItems: 'center',
  },

  rank: {
    color: '#D1D5DB',
    fontSize: 15,
    fontWeight: 'bold',
  },

  topRank: {
    fontSize: 21,
  },

  playerAvatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },

  playerAvatarText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  playerInfo: {
    flex: 1,
    minWidth: 0,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  playerName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
  },

  youBadge: {
    color: '#818CF8',
    backgroundColor: '#312E81',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 7,
  },

  playerLevel: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
  },

  playerScore: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },

  playerXP: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  xpLabel: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: 'bold',
  },

  emptyCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },

  emptyEmoji: {
    fontSize: 50,
  },

  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },

  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 7,
  },

  bottomSpace: {
    height: 100,
  },

  bottomNav: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 15,
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
    fontSize: 20,
  },

  navText: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 3,
  },
});