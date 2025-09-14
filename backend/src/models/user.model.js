import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    encryptionKey: {
      keyId: {
        type: String,
        default: null,
      },
      key: {
        type: String,
        default: null,
      },
      createdAt: {
        type: Date,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
      rotatedAt: {
        type: Date,
        default: null,
      },
    },
    securitySettings: {
      encryptionEnabled: {
        type: Boolean,
        default: true,
      },
      keyRotationEnabled: {
        type: Boolean,
        default: true,
      },
      lastSecurityUpdate: {
        type: Date,
        default: Date.now,
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
