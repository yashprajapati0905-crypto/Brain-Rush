
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

const themeSets = [
  ['🍎', '🍌', '🍇', '🍊', '🍉', '🥝'],
  ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁'],
  ['🚗', '🚕', '🚓', '🚑', '🚒', '🚌'],
  ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐'],
  ['🚀', '🌎', '🌙', '⭐', '🪐', '☄️'],
];

type PowerCard = {
  type: 'reveal' | 'time' | 'double';
  index: number;
};

export default function MemoryRushScreen() {
  const [gameCards, setGameCards] = useState<string[]>([]);
  const [opened, setOpened] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);

  const [level, setLevel] = useState(1);
  const [pairs, setPairs] = useState(6);

  const [preview, setPreview] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [saving, setSaving] = useState(false);

  const [doubleScore, setDoubleScore] = useState(false);
  const [powerCards, setPowerCards] = useState<PowerCard[]>([]);

  const scoreRef = useRef(0);
  const gameEndedRef = useRef(false);
  const openedRef = useRef<number[]>([]);
  const matchedRef = useRef<number[]>([]);
  const comboRef = useRef(0);
  const livesRef = useRef(3);
  const doubleScoreRef = useRef(false);

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const previewTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const mismatchTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const shuffle = (array: string[]) => {
    return [...array].sort(
      () => Math.random() - 0.5
    );
  };

  const createDeck = (numberOfPairs: number) => {
    const theme =
      themeSets[
        Math.floor(
          Math.random() * themeSets.length
        )
      ];

    const selected = theme.slice(
      0,
      numberOfPairs
    );

    return shuffle([
      ...selected,
      ...selected,
    ]);
  };

  const createPowerCards = (
    deckLength: number
  ) => {
    const powers: PowerCard[] = [];

    const used = new Set<number>();

    const types: PowerCard['type'][] = [
      'reveal',
      'time',
      'double',
    ];

    types.forEach((type) => {
      let index = Math.floor(
        Math.random() * deckLength
      );

      while (used.has(index)) {
        index = Math.floor(
          Math.random() * deckLength
        );
      }

      used.add(index);

      powers.push({
        type,
        index,
      });
    });

    return powers;
  };

  const saveScore = async (
    finalScore: number
  ) => {
    try {
      setSaving(true);

      const token =
        await AsyncStorage.getItem('token');

      if (!token) {
        router.replace('/');
        return null;
      }

      const oldUserString =
        await AsyncStorage.getItem('user');

      let oldAchievements: string[] = [];

      if (oldUserString) {
        try {
          const oldUser =
            JSON.parse(oldUserString);

          oldAchievements =
            oldUser.achievements || [];
        } catch {}
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
            game: 'Memory Rush',
            score: finalScore,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.user) {
        await AsyncStorage.setItem(
          'user',
          JSON.stringify(data.user)
        );

        const updatedAchievements =
          data.user.achievements || [];

        const unlockedNow =
          updatedAchievements.find(
            (id: string) =>
              !oldAchievements.includes(id)
          );

        return {
          user: data.user,
          achievement:
            unlockedNow || '',
        };
      }

      return null;
    } catch (error) {
      console.error(
        'MEMORY SCORE ERROR:',
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

    if (previewTimerRef.current) {
      clearTimeout(
        previewTimerRef.current
      );
      previewTimerRef.current = null;
    }

    if (mismatchTimerRef.current) {
      clearTimeout(
        mismatchTimerRef.current
      );
      mismatchTimerRef.current = null;
    }

    setGameOver(true);

    const finalScore =
      scoreRef.current;

    const result =
      await saveScore(finalScore);

    if (result?.user) {
      router.replace({
        pathname: '/result',
        params: {
          game: 'Memory Rush',
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
      router.replace({
        pathname: '/result',
        params: {
          game: 'Memory Rush',
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

  const startGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (previewTimerRef.current) {
      clearTimeout(
        previewTimerRef.current
      );
      previewTimerRef.current = null;
    }

    if (mismatchTimerRef.current) {
      clearTimeout(
        mismatchTimerRef.current
      );
      mismatchTimerRef.current = null;
    }

    gameEndedRef.current = false;

    scoreRef.current = 0;
    openedRef.current = [];
    matchedRef.current = [];
    comboRef.current = 0;
    livesRef.current = 3;
    doubleScoreRef.current = false;

    const startingPairs = 6;
    const deck = createDeck(startingPairs);

    setGameCards(deck);
    setOpened(
      Array.from(
        { length: deck.length },
        (_, index) => index
      )
    );

    setMatched([]);
    setScore(0);
    setTimeLeft(30);
    setMoves(0);
    setCombo(0);
    setLives(3);
    setLevel(1);
    setPairs(startingPairs);
    setPreview(true);
    setGameOver(false);
    setSaving(false);
    setDoubleScore(false);

    setPowerCards(
      createPowerCards(deck.length)
    );

    /*
      3-second memory preview.
    */
    previewTimerRef.current =
      setTimeout(() => {
        if (gameEndedRef.current) {
          return;
        }

        setOpened([]);
        openedRef.current = [];
        setPreview(false);

        startTimer();
      }, 3000);
  };

  useEffect(() => {
    startGame();

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );
      }

      if (previewTimerRef.current) {
        clearTimeout(
          previewTimerRef.current
        );
      }

      if (mismatchTimerRef.current) {
        clearTimeout(
          mismatchTimerRef.current
        );
      }
    };
  }, []);

  const nextLevel = () => {
    if (level >= 4) {
      return;
    }

    const newLevel = level + 1;
    const newPairs = Math.min(
      6 + newLevel - 1,
      9
    );

    setLevel(newLevel);
    setPairs(newPairs);

    const deck = createDeck(newPairs);

    setGameCards(deck);
    setMatched([]);
    matchedRef.current = [];

    setOpened(
      Array.from(
        { length: deck.length },
        (_, index) => index
      )
    );

    openedRef.current =
      Array.from(
        { length: deck.length },
        (_, index) => index
      );

    setPowerCards(
      createPowerCards(deck.length)
    );

    setPreview(true);

    if (previewTimerRef.current) {
      clearTimeout(
        previewTimerRef.current
      );
    }

    previewTimerRef.current =
      setTimeout(() => {
        setOpened([]);
        openedRef.current = [];
        setPreview(false);
      }, 2000);
  };

  useEffect(() => {
    if (
      matched.length === gameCards.length &&
      gameCards.length > 0 &&
      !preview
    ) {
      if (level < 4) {
        nextLevel();
      } else {
        endGame();
      }
    }
  }, [matched, gameCards, preview]);

  const activatePower = (
    power: PowerCard
  ) => {
    if (gameEndedRef.current) {
      return;
    }

    if (power.type === 'reveal') {
      const hiddenIndexes =
        gameCards
          .map((_, index) => index)
          .filter(
            (index) =>
              !matchedRef.current.includes(
                index
              )
          );

      const revealIndexes =
        hiddenIndexes.slice(0, 2);

      setOpened((previous) => [
        ...previous,
        ...revealIndexes,
      ]);

      setTimeout(() => {
        setOpened((previous) =>
          previous.filter(
            (index) =>
              !revealIndexes.includes(
                index
              )
          )
        );
      }, 1200);
    }

    if (power.type === 'time') {
      setTimeLeft(
        (previous) => previous + 5
      );
    }

    if (power.type === 'double') {
      doubleScoreRef.current = true;
      setDoubleScore(true);

      setTimeout(() => {
        doubleScoreRef.current = false;
        setDoubleScore(false);
      }, 8000);
    }

    setPowerCards((previous) =>
      previous.filter(
        (item) => item.index !== power.index
      )
    );
  };

  const handleCardPress = (
    index: number
  ) => {
    if (
      gameEndedRef.current ||
      preview ||
      saving
    ) {
      return;
    }

    if (openedRef.current.includes(index)) {
      return;
    }

    if (matchedRef.current.includes(index)) {
      return;
    }

    if (openedRef.current.length >= 2) {
      return;
    }

    const power = powerCards.find(
      (item) => item.index === index
    );

    if (power) {
      activatePower(power);
      return;
    }

    const newOpened = [
      ...openedRef.current,
      index,
    ];

    openedRef.current = newOpened;
    setOpened(newOpened);

    if (newOpened.length === 2) {
      setMoves(
        (previous) => previous + 1
      );

      const firstIndex =
        newOpened[0];

      const secondIndex =
        newOpened[1];

      const isMatch =
        gameCards[firstIndex] ===
        gameCards[secondIndex];

      if (isMatch) {
        const newMatched = [
          ...matchedRef.current,
          firstIndex,
          secondIndex,
        ];

        matchedRef.current =
          newMatched;

        setMatched(newMatched);

        const newCombo =
          comboRef.current + 1;

        comboRef.current =
          newCombo;

        setCombo(newCombo);

        let points = 20;

        if (newCombo >= 2) {
          points +=
            (newCombo - 1) * 5;
        }

        if (doubleScoreRef.current) {
          points *= 2;
        }

        const newScore =
          scoreRef.current + points;

        scoreRef.current =
          newScore;

        setScore(newScore);

        openedRef.current = [];
        setOpened([]);
      } else {
        livesRef.current -= 1;

        const remainingLives =
          livesRef.current;

        setLives(remainingLives);

        comboRef.current = 0;
        setCombo(0);

        mismatchTimerRef.current =
          setTimeout(() => {
            openedRef.current = [];
            setOpened([]);

            mismatchTimerRef.current =
              null;

            if (
              remainingLives <= 0
            ) {
              endGame();
            }
          }, 700);
      }
    }
  };

  const matchedPairs =
    matched.length / 2;

  const totalPairs =
    gameCards.length / 2;

  const progress =
    totalPairs > 0
      ? matchedPairs / totalPairs
      : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🧠 Memory Rush
      </Text>

      <Text style={styles.subtitle}>
        Remember • Match • Survive
      </Text>

      {/* LEVEL */}
      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>
          LEVEL {level}
        </Text>

        <Text style={styles.levelPairs}>
          {pairs} PAIRS
        </Text>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>
            ⏱️
          </Text>

          <Text style={styles.statValue}>
            {timeLeft}
          </Text>

          <Text style={styles.statLabel}>
            TIME
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statIcon}>
            ❤️
          </Text>

          <Text style={styles.statValue}>
            {lives}
          </Text>

          <Text style={styles.statLabel}>
            LIVES
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statIcon}>
            🎯
          </Text>

          <Text style={styles.statValue}>
            {score}
          </Text>

          <Text style={styles.statLabel}>
            SCORE
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statIcon}>
            🔄
          </Text>

          <Text style={styles.statValue}>
            {moves}
          </Text>

          <Text style={styles.statLabel}>
            MOVES
          </Text>
        </View>
      </View>

      {/* PREVIEW */}
      {preview && (
        <View style={styles.previewBox}>
          <Text style={styles.previewText}>
            👀 MEMORIZE!
          </Text>

          <Text style={styles.previewTimer}>
            Remember the cards...
          </Text>
        </View>
      )}

      {/* COMBO */}
      {combo > 0 && !preview && (
        <View style={styles.comboBox}>
          <Text style={styles.comboText}>
            🔥 {combo}x COMBO
          </Text>

          {combo >= 2 && (
            <Text style={styles.comboBonus}>
              BONUS ACTIVE
            </Text>
          )}
        </View>
      )}

      {/* DOUBLE SCORE */}
      {doubleScore && (
        <View style={styles.doubleBox}>
          <Text style={styles.doubleText}>
            💎 2X SCORE ACTIVE!
          </Text>
        </View>
      )}

      {/* PROGRESS */}
      <View style={styles.progressSection}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>
            MEMORY PROGRESS
          </Text>

          <Text style={styles.progressCount}>
            {matchedPairs}/{totalPairs}
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* CARDS */}
      <View style={styles.grid}>
        {gameCards.map((card, index) => {
          const isOpened =
            opened.includes(index);

          const isMatched =
            matched.includes(index);

          const power =
            powerCards.find(
              (item) =>
                item.index === index
            );

          return (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.card,

                isOpened &&
                  styles.openedCard,

                isMatched &&
                  styles.matchedCard,

                pressed &&
                  styles.cardPressed,
              ]}
              onPress={() =>
                handleCardPress(index)
              }
              disabled={
                isMatched || saving
              }
            >
              {isOpened || isMatched ? (
                <Text style={styles.cardText}>
                  {card}
                </Text>
              ) : power ? (
                <Text style={styles.powerText}>
                  {power.type ===
                    'reveal' && '🔍'}

                  {power.type ===
                    'time' && '⏱️'}

                  {power.type ===
                    'double' && '💎'}
                </Text>
              ) : (
                <Text style={styles.cardText}>
                  ❓
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* POWER GUIDE */}
      <View style={styles.powerGuide}>
        <Text style={styles.powerGuideText}>
          🔍 Reveal   •   ⏱️ +5 Sec   •   💎 2X Score
        </Text>
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
    paddingHorizontal: 16,
    paddingTop: 35,
    alignItems: 'center',
  },

  title: {
    color: '#ffffff',
    fontSize: 29,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 3,
    marginBottom: 10,
  },

  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#312E81',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 10,
  },

  levelText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  levelPairs: {
    color: '#A5B4FC',
    fontSize: 10,
    fontWeight: 'bold',
  },

  statsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  stat: {
    width: '23.5%',
    backgroundColor: '#1F2937',
    borderRadius: 13,
    paddingVertical: 7,
    alignItems: 'center',
  },

  statIcon: {
    fontSize: 15,
  },

  statValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },

  statLabel: {
    color: '#9CA3AF',
    fontSize: 8,
    marginTop: 1,
  },

  previewBox: {
    backgroundColor: '#312E81',
    borderRadius: 13,
    paddingHorizontal: 20,
    paddingVertical: 7,
    marginBottom: 8,
    alignItems: 'center',
  },

  previewText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },

  previewTimer: {
    color: '#C7D2FE',
    fontSize: 9,
    marginTop: 2,
  },

  comboBox: {
    backgroundColor: '#3F1D3A',
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 7,
    marginBottom: 8,
    flexDirection: 'row',
    gap: 8,
  },

  comboText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },

  comboBonus: {
    color: '#F9A8D4',
    fontSize: 10,
    fontWeight: 'bold',
  },

  doubleBox: {
    backgroundColor: '#713F12',
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 7,
    marginBottom: 8,
  },

  doubleText: {
    color: '#FDE68A',
    fontSize: 12,
    fontWeight: 'bold',
  },

  progressSection: {
    width: '100%',
    marginBottom: 10,
  },

  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  progressLabel: {
    color: '#9CA3AF',
    fontSize: 8,
    fontWeight: 'bold',
  },

  progressCount: {
    color: '#A5B4FC',
    fontSize: 9,
    fontWeight: 'bold',
  },

  progressBackground: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 10,
  },

  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 7,
  },

  card: {
    width: 72,
    height: 72,
    backgroundColor: '#1F2937',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },

  openedCard: {
    backgroundColor: '#312E81',
    borderColor: '#6366F1',
  },

  matchedCard: {
    backgroundColor: '#14532D',
    borderColor: '#22C55E',
    opacity: 0.72,
  },

  cardPressed: {
    transform: [
      {
        scale: 0.93,
      },
    ],
  },

  cardText: {
    fontSize: 30,
  },

  powerText: {
    fontSize: 26,
  },

  powerGuide: {
    marginTop: 10,
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  powerGuideText: {
    color: '#9CA3AF',
    fontSize: 9,
    textAlign: 'center',
  },

  savingText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 8,
  },
});
