import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    email: {
      type: String,
      required: true,
      unique: true, // two accounts can't share an email
      lowercase: true, // "Ola@Mail.com" and "ola@mail.com" count as the same
      trim: true,
    },
    // The HASHED password, never the real one.
    // select: false = left out of query results unless we ask for it on purpose.
    passwordHash: { type: String, required: true, select: false },

    // Forgot password: a SCRAMBLED copy of the one-time token + when it stops working
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

export type UserDoc = InferSchemaType<typeof userSchema>;

// Reuse the model if it already exists (avoids "Cannot overwrite model" on hot reload)
export const User =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", userSchema);