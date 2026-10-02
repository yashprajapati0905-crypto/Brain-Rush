const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const getUserIdFromToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// Check and unlock achievements
const updateAchievements = (user) => {
  const achievements = new Set(
    user.achievements || []
  );

  // First Game
  if ((user.gamesPlayed || 0) >= 1) {
    achievements.add('first_game');
  }

  // High Scorer
  if ((user.bestScore || 0) >= 50) {
    achievements.add('high_scorer');
  }

  // 3 Day Streak
  if ((user.streak || 0) >= 3) {
    achievements.add('streak_3');
  }

  // 7 Day Streak
  if ((user.streak || 0) >= 7) {
    achievements.add('streak_7');
  }

  // XP Hunter
  if ((user.xp || 0) >= 500) {
    achievements.add('xp_hunter');
  }

  // Brain Master
  if ((user.gamesPlayed || 0) >= 20) {
    achievements.add('brain_master');
  }

  user.achievements =
    Array.from(achievements);
};

// Save normal game score
router.post('/score', async (req, res) => {
  try {
    const userId =
      getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const { game, score } = req.body;

    if (
      !game ||
      typeof score !== 'number'
    ) {
      return res.status(400).json({
        message:
          'Game and score are required',
      });
    }

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const xpEarned =
      Math.max(0, score);

    user.xp =
      (user.xp || 0) + xpEarned;

    user.gamesPlayed =
      (user.gamesPlayed || 0) + 1;

    if (
      score >
      (user.bestScore || 0)
    ) {
      user.bestScore = score;
    }

    user.level =
      Math.floor(user.xp / 500) + 1;

    updateAchievements(user);

    await user.save();

    res.json({
      message:
        'Score saved successfully',
      game,
      score,
      xpEarned,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        bestScore: user.bestScore,
        gamesPlayed:
          user.gamesPlayed,
        achievements:
          user.achievements,
        lastDailyChallenge:
          user.lastDailyChallenge,
      },
    });
  } catch (error) {
    console.error(
      'Score Error:',
      error
    );

    res.status(500).json({
      message:
        'Failed to save score',
    });
  }
});

// ===============================
// LEADERBOARD
// ===============================

router.get(
  '/leaderboard',
  async (req, res) => {
    try {
      const userId =
        getUserIdFromToken(req);

      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      // Get top 20 users by XP
      const topUsers =
        await User.find({})
          .select(
            'name xp level bestScore gamesPlayed'
          )
          .sort({
            xp: -1,
            bestScore: -1,
          })
          .limit(20)
          .lean();

      // Add rank
      const leaderboard =
        topUsers.map(
          (user, index) => ({
            rank: index + 1,
            id: user._id,
            name: user.name,
            xp: user.xp || 0,
            level: user.level || 1,
            bestScore:
              user.bestScore || 0,
            gamesPlayed:
              user.gamesPlayed || 0,
          })
        );

      // Find current user's rank
      const currentUser =
        await User.findById(userId)
          .select(
            'name xp level bestScore gamesPlayed'
          )
          .lean();

      if (!currentUser) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      const usersAhead =
        await User.countDocuments({
          $or: [
            {
              xp: {
                $gt:
                  currentUser.xp || 0,
              },
            },
            {
              xp:
                currentUser.xp || 0,
              bestScore: {
                $gt:
                  currentUser.bestScore ||
                  0,
              },
            },
          ],
        });

      const currentUserRank =
        usersAhead + 1;

      res.json({
        leaderboard,
        currentUser: {
          rank: currentUserRank,
          id: currentUser._id,
          name: currentUser.name,
          xp: currentUser.xp || 0,
          level:
            currentUser.level || 1,
          bestScore:
            currentUser.bestScore || 0,
          gamesPlayed:
            currentUser.gamesPlayed || 0,
        },
      });
    } catch (error) {
      console.error(
        'Leaderboard Error:',
        error
      );

      res.status(500).json({
        message:
          'Failed to load leaderboard',
      });
    }
  }
);

// Check Daily Challenge Status
router.get(
  '/daily-status',
  async (req, res) => {
    try {
      const userId =
        getUserIdFromToken(req);

      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      const today = new Date();

      let completed = false;

      if (user.lastDailyChallenge) {
        const lastDate =
          new Date(
            user.lastDailyChallenge
          );

        completed =
          lastDate.getUTCFullYear() ===
            today.getUTCFullYear() &&
          lastDate.getUTCMonth() ===
            today.getUTCMonth() &&
          lastDate.getUTCDate() ===
            today.getUTCDate();
      }

      res.json({
        completed,
        streak:
          user.streak || 0,
      });
    } catch (error) {
      console.error(
        'Daily Status Error:',
        error
      );

      res.status(500).json({
        message:
          'Failed to check Daily Challenge status',
      });
    }
  }
);

// Daily Challenge + XP + Streak
router.post(
  '/daily-complete',
  async (req, res) => {
    try {
      const userId =
        getUserIdFromToken(req);

      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      const today = new Date();

      if (user.lastDailyChallenge) {
        const lastDate =
          new Date(
            user.lastDailyChallenge
          );

        const sameDay =
          lastDate.getUTCFullYear() ===
            today.getUTCFullYear() &&
          lastDate.getUTCMonth() ===
            today.getUTCMonth() &&
          lastDate.getUTCDate() ===
            today.getUTCDate();

        if (sameDay) {
          return res.status(400).json({
            message:
              'Daily Challenge already completed today',
            streak:
              user.streak || 0,
          });
        }
      }

      let newStreak = 1;

      if (user.lastDailyChallenge) {
        const lastDate =
          new Date(
            user.lastDailyChallenge
          );

        const yesterday =
          new Date(today);

        yesterday.setUTCDate(
          yesterday.getUTCDate() - 1
        );

        const wasYesterday =
          lastDate.getUTCFullYear() ===
            yesterday.getUTCFullYear() &&
          lastDate.getUTCMonth() ===
            yesterday.getUTCMonth() &&
          lastDate.getUTCDate() ===
            yesterday.getUTCDate();

        if (wasYesterday) {
          newStreak =
            (user.streak || 0) + 1;
        }
      }

      const rewardXP = 50;

      user.xp =
        (user.xp || 0) + rewardXP;

      user.level =
        Math.floor(user.xp / 500) + 1;

      user.streak =
        newStreak;

      user.lastDailyChallenge =
        today;

      updateAchievements(user);

      await user.save();

      res.json({
        message:
          'Daily Challenge completed',
        rewardXP,
        streak: newStreak,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          bestScore:
            user.bestScore,
          gamesPlayed:
            user.gamesPlayed,
          achievements:
            user.achievements,
          lastDailyChallenge:
            user.lastDailyChallenge,
        },
      });
    } catch (error) {
      console.error(
        'Daily Challenge Error:',
        error
      );

      res.status(500).json({
        message:
          'Failed to complete Daily Challenge',
      });
    }
  }
);

module.exports = router;