const { v4: uuidv4 } = require("uuid");

const OTP_EXPIRY_MS = 15 * 60 * 1000;
const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000;
const OTP_LENGTH = 6;
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_REQUESTS_PER_EMAIL_WINDOW = 3;
const REQUEST_WINDOW_MS = 15 * 60 * 1000;

let usersRef = [];
const passwordRecoveryRequests = [];

function setUsers(users) {
  usersRef = users;
}

function clearRecoveryRequests() {
  passwordRecoveryRequests.length = 0;
}

function generateOtp() {
  const max = Math.pow(10, OTP_LENGTH);
  const num = Math.floor(Math.random() * max);
  return String(num).padStart(OTP_LENGTH, "0");
}

function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return usersRef.find((u) => u.email.trim().toLowerCase() === normalized);
}

function countRecentRequests(email) {
  const normalized = email.trim().toLowerCase();
  const windowStart = Date.now() - REQUEST_WINDOW_MS;
  return passwordRecoveryRequests.filter(
    (r) => r.email === normalized && new Date(r.createdAt).getTime() >= windowStart
  ).length;
}

function invalidatePendingForEmail(email) {
  const normalized = email.trim().toLowerCase();
  passwordRecoveryRequests.forEach((r) => {
    if (r.email === normalized && !r.consumed) {
      r.consumed = true;
    }
  });
}

function createRecoveryRecord(email, otp) {
  const normalized = email.trim().toLowerCase();
  const record = {
    id: uuidv4(),
    email: normalized,
    otp,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS).toISOString(),
    verified: false,
    resetToken: null,
    resetTokenExpiresAt: null,
    consumed: false,
    verifyAttempts: 0,
    createdAt: new Date().toISOString(),
  };
  passwordRecoveryRequests.push(record);
  return record;
}

function findActiveRecord(email) {
  const normalized = email.trim().toLowerCase();
  return passwordRecoveryRequests
    .filter((r) => r.email === normalized && !r.consumed)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
}

function findVerifiedRecord(email, resetToken) {
  const normalized = email.trim().toLowerCase();
  return passwordRecoveryRequests.find(
    (r) =>
      r.email === normalized &&
      r.resetToken === resetToken &&
      r.verified &&
      !r.consumed &&
      r.resetTokenExpiresAt &&
      new Date(r.resetTokenExpiresAt).getTime() > Date.now()
  );
}

module.exports = {
  OTP_EXPIRY_MS,
  RESET_TOKEN_EXPIRY_MS,
  OTP_LENGTH,
  MAX_VERIFY_ATTEMPTS,
  MAX_REQUESTS_PER_EMAIL_WINDOW,
  REQUEST_WINDOW_MS,
  passwordRecoveryRequests,
  setUsers,
  clearRecoveryRequests,
  generateOtp,
  findUserByEmail,
  countRecentRequests,
  invalidatePendingForEmail,
  createRecoveryRecord,
  findActiveRecord,
  findVerifiedRecord,
};
