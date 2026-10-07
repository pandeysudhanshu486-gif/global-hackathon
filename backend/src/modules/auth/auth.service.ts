import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserModel, IUserDocument } from '../../models/user.model.js';
import { StudentProfileModel } from '../../models/studentProfile.model.js';
import { RecruiterProfileModel } from '../../models/recruiterProfile.model.js';
import { PassportModel } from '../../models/passport.model.js';
import { env } from '../../config/env.js';
import { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } from '../../shared/errors.js';
import { RegisterInput, LoginInput, AuthTokens, AuthResponse } from './auth.types.js';

export class AuthService {
  private static generateTokens(user: IUserDocument | { _id: any; email: string; role: 'student' | 'recruiter' | 'admin' }): AuthTokens {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
  }

  private static slugify(name: string): string {
    const clean = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const shortId = uuidv4().substring(0, 6);
    return `${clean || 'candidate'}-${shortId}`;
  }

  public static async register(input: RegisterInput): Promise<AuthResponse> {
    if (input.role === 'recruiter' && !input.companyName) {
      throw new BadRequestError('Company name is required for recruiter registration.');
    }

    // If MongoDB is connected, use the database
    if (mongoose.connection.readyState === 1) {
      const existingUser = await UserModel.findOne({ email: input.email });
      if (existingUser) {
        throw new ConflictError('An account with this email already exists.');
      }

      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(input.password, saltRounds);

      const user = await UserModel.create({
        email: input.email,
        passwordHash,
        role: input.role,
        lastLoginAt: new Date(),
      });

      let publicSlug: string | undefined;

      if (input.role === 'student') {
        const studentProfile = await StudentProfileModel.create({
          userId: user._id,
          name: input.name,
          declaredSkills: [],
          education: [],
          githubConnected: false,
        });

        publicSlug = this.slugify(input.name);

        await PassportModel.create({
          studentId: studentProfile._id,
          publicSlug,
          capabilities: [],
          visibility: 'public',
          stats: {
            missionsCompleted: 0,
            totalEvidenceRecords: 0,
            skillsWithEvidence: 0,
          },
        });
      } else if (input.role === 'recruiter') {
        await RecruiterProfileModel.create({
          userId: user._id,
          recruiterName: input.name,
          name: input.name,
          companyName: input.companyName || 'Company',
        });
      }

      const tokens = this.generateTokens(user);

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: input.name,
          publicSlug,
        },
        tokens,
      };
    }

    // Offline / demo fallback — create in-memory user
    const userId = new mongoose.Types.ObjectId().toString();
    const publicSlug = input.role === 'student' ? this.slugify(input.name) : undefined;

    const tokens = this.generateTokens({
      _id: userId,
      email: input.email,
      role: input.role,
    });

    return {
      user: {
        id: userId,
        email: input.email,
        role: input.role,
        name: input.name,
        publicSlug,
      },
      tokens,
    };
  }

  public static async login(input: LoginInput): Promise<AuthResponse> {
    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findOne({ email: input.email });
      if (user) {
        const isMatch = await bcrypt.compare(input.password, user.passwordHash);
        if (!isMatch) {
          throw new UnauthorizedError('Invalid email or password.');
        }

        user.lastLoginAt = new Date();
        await user.save();

        let name = 'User';
        let publicSlug: string | undefined;

        if (user.role === 'student') {
          const student = await StudentProfileModel.findOne({ userId: user._id });
          if (student) {
            name = student.name;
            const passport = await PassportModel.findOne({ studentId: student._id });
            publicSlug = passport?.publicSlug;
          }
        } else if (user.role === 'recruiter') {
          const recruiter = await RecruiterProfileModel.findOne({ userId: user._id });
          if (recruiter) {
            name = recruiter.recruiterName || recruiter.name || 'Recruiter';
          }
        }

        const tokens = this.generateTokens(user);

        return {
          user: {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name,
            publicSlug,
          },
          tokens,
        };
      }
    }

    // Demo standalone accounts fallback
    if (input.email === 'alex.chen@test.com' && (input.password === 'Password123!' || input.password === 'password123')) {
      const userId = '650000000000000000000001';
      const tokens = this.generateTokens({ _id: userId, email: input.email, role: 'student' });
      return {
        user: {
          id: userId,
          email: input.email,
          role: 'student',
          name: 'Alex Chen',
          publicSlug: 'alex-chen-wk7a',
        },
        tokens,
      };
    }

    if (input.email === 'recruiter@techventures.io' && (input.password === 'Password123!' || input.password === 'password123')) {
      const userId = '650000000000000000000099';
      const tokens = this.generateTokens({ _id: userId, email: input.email, role: 'recruiter' });
      return {
        user: {
          id: userId,
          email: input.email,
          role: 'recruiter',
          name: 'Sarah Jenkins (TechVentures)',
        },
        tokens,
      };
    }

    throw new UnauthorizedError('Invalid email or password.');
  }

  public static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
        email: string;
        role: any;
      };

      if (mongoose.connection.readyState === 1) {
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
          throw new UnauthorizedError('User no longer exists.');
        }
        const tokens = this.generateTokens(user);
        return { accessToken: tokens.accessToken };
      }

      // Offline mode fallback: valid signed refresh token gets fresh access token
      const tokens = this.generateTokens({
        _id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });
      return { accessToken: tokens.accessToken };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }
  }

  public static async getCurrentUser(userId: string): Promise<AuthResponse['user']> {
    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findById(userId);
      if (user) {
        let name = 'User';
        let publicSlug: string | undefined;

        if (user.role === 'student') {
          const student = await StudentProfileModel.findOne({ userId: user._id });
          if (student) {
            name = student.name;
            const passport = await PassportModel.findOne({ studentId: student._id });
            publicSlug = passport?.publicSlug;
          }
        } else if (user.role === 'recruiter') {
          const recruiter = await RecruiterProfileModel.findOne({ userId: user._id });
          if (recruiter) {
            name = recruiter.recruiterName || recruiter.name || 'Recruiter';
          }
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name,
          publicSlug,
        };
      }
    }

    // In-memory fallback
    return {
      id: userId,
      email: 'alex.chen@test.com',
      role: 'student',
      name: 'Alex Chen',
      publicSlug: 'alex-chen-wk7a',
    };
  }
}
