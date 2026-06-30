import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LocalDb } from '../services/localDb';
import { User } from '../types';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_sunshine_todo';

// POST /api/auth/register
router.post('/register', async (req: any, res: Response): Promise<any> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const users = LocalDb.get('users') as Record<string, User & { passwordHash?: string }>;

    // Check if user already exists
    const emailExists = Object.values(users).some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create a new user
    const uid = 'user-' + Math.random().toString(36).substr(2, 9);
    const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('ishika') || email.toLowerCase().includes('jas@sunshine.com');
    
    const newUser: User & { passwordHash?: string } = {
      uid,
      displayName: name,
      email: email.toLowerCase(),
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      isAdmin,
      passwordHash,
    };

    // Save user to database
    users[uid] = newUser;
    LocalDb.set('users', users);

    // Generate JWT token
    const token = jwt.sign(
      { uid, email: newUser.email, isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return profile (without passwordHash) and token
    const { passwordHash: _, ...profile } = newUser;
    return res.status(201).json({
      user: profile,
      token,
    });
  } catch (error) {
    console.error('Error during custom registration:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: any, res: Response): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const users = LocalDb.get('users') as Record<string, User & { passwordHash?: string }>;

    // Find user by email
    const user = Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Compare password hash (or check mock password for pre-existing accounts)
    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    } else {
      // Pre-existing mock accounts (ishika@sunshine.com -> admin123, sunshine@example.com -> sunshine123)
      // Allow raw match for seamless transition of those default accounts
      const defaultPassword = (user.email.includes('admin') || user.email.includes('ishika') || user.email.includes('jas')) ? 'admin123' : 'sunshine123';
      isMatch = (password === defaultPassword);
      
      // Upgrade their password in the database to a secure hash for future logins
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);
        users[user.uid] = user;
        LocalDb.set('users', users);
      }
    }

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { uid: user.uid, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return profile (without passwordHash) and token
    const { passwordHash: _, ...profile } = user;
    return res.status(200).json({
      user: profile,
      token,
    });
  } catch (error) {
    console.error('Error during custom login:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// PUT /api/auth/profile — Update display name or avatar
router.put('/profile', authMiddleware as any, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { displayName, photoURL } = req.body;
  const uid = req.user?.uid;

  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized. Missing user session.' });
  }

  try {
    const users = LocalDb.get('users') as Record<string, User & { passwordHash?: string }>;
    const user = users[uid];

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update fields if provided
    if (displayName) user.displayName = displayName;
    if (photoURL) user.photoURL = photoURL;

    users[uid] = user;
    LocalDb.set('users', users);

    const { passwordHash: _, ...profile } = user;
    return res.json({
      message: 'Profile updated successfully.',
      user: profile
    });
  } catch (error) {
    console.error('Error updating custom profile:', error);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// PUT /api/auth/password — Change password
router.put('/password', authMiddleware as any, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { newPassword } = req.body;
  const uid = req.user?.uid;

  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized. Missing user session.' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const users = LocalDb.get('users') as Record<string, User & { passwordHash?: string }>;
    const user = users[uid];

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    users[uid] = user;
    LocalDb.set('users', users);

    return res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error changing custom password:', error);
    return res.status(500).json({ error: 'Failed to change password.' });
  }
});

export default router;
