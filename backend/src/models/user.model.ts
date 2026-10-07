import mongoose, { Document, Model, Schema } from 'mongoose';

export type UserRole = 'student' | 'recruiter' | 'admin';

export interface IUser {
  email: string;
  passwordHash: string;
  role: UserRole;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'recruiter', 'admin'],
      default: 'student',
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
