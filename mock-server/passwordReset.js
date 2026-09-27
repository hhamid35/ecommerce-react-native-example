const crypto = require("crypto");

// In-memory password-reset state for the mock-server. Codes and reset tokens
// are stored only as SHA-256 hashes and compared in constant time, so the mock
// demonstrates the model the production backend must follow. The clock and
// the delivery callback are injectable so this module can be unit-tested
// without starting Express.

const EMAIL_PATTERN = /^[^@ ]+@[^@ ]+[.][^@ ]+$/;
const PASSWORD_RULE_TEXT =
  "Password must be at least 8 characters and include a letter and a number";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isValidEmail = (email) => {
  const normalized = normalizeEmail(email);
  return normalized.length > 0 && normalized.length <= 254 && EMAIL_PATTERN.test(normalized);
};

// Must match utils/passwordPolicy.js#validatePassword exactly.
const validatePasswordPolicy = (password) => {
  const value = String(password || "");
  if (value === "") return "Please enter a password";
  if (value.length > 128) return "Password must be at most 128 characters";
  if (value.length < 8 || !/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return PASSWORD_RULE_TEXT;
  }
  return null;
};

const hash = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

const safeEqual = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
};

const createPasswordResetStore = ({
  now = () => Date.now(),
  codeTtlMs = 900000,
  resetTokenTtlMs = 600000,
  maxAttempts = 5,
  requestIntervalMs = 60000,
  deliver = () => {},
} = {}) => {
  const records = new Map();

  // Unknown emails get a stand-in record (userId: null) whose code is never
  // delivered and never matches, so throttling, expiry and lockout look
  // identical for registered and unregistered emails.
  const requestReset = (email, user) => {
    const key = normalizeEmail(email);
    const existing = records.get(key);
    if (existing && now() - existing.requestedAt < requestIntervalMs) {
      const remainingMs = requestIntervalMs - (now() - existing.requestedAt);
      return { ok: false, err: "RESET_THROTTLED", retryAfterSeconds: Math.ceil(remainingMs / 1000) };
    }
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    const expiresAt = now() + codeTtlMs;
    // Newest request wins: replacing the record cancels any earlier code.
    records.set(key, {
      email: key,
      userId: user ? user._id : null,
      codeHash: hash(code),
      expiresAt,
      attempts: 0,
      state: "PENDING",
      requestedAt: now(),
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    });
    if (user) deliver(key, code, expiresAt);
    return { ok: true };
  };

  const verifyCode = (email, code) => {
    const record = records.get(normalizeEmail(email));
    if (!record) return { ok: false, err: "RESET_CODE_INVALID" };
    if (record.state === "LOCKED") return { ok: false, err: "RESET_ATTEMPTS_EXCEEDED" };
    // Already exchanged for a reset token.
    if (record.state === "VERIFIED") return { ok: false, err: "RESET_CODE_EXPIRED" };
    if (now() > record.expiresAt) return { ok: false, err: "RESET_CODE_EXPIRED" };

    const matches = record.userId !== null && safeEqual(hash(code), record.codeHash);
    if (!matches) {
      record.attempts += 1;
      if (record.attempts >= maxAttempts) {
        record.state = "LOCKED";
        return { ok: false, err: "RESET_ATTEMPTS_EXCEEDED" };
      }
      return { ok: false, err: "RESET_CODE_INVALID" };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    record.state = "VERIFIED";
    record.resetTokenHash = hash(resetToken);
    record.resetTokenExpiresAt = now() + resetTokenTtlMs;
    return { ok: true, resetToken, expiresAt: record.resetTokenExpiresAt };
  };

  const consumeResetToken = (resetToken) => {
    const tokenHash = hash(resetToken);
    for (const [key, record] of records) {
      if (record.state === "VERIFIED" && safeEqual(tokenHash, record.resetTokenHash)) {
        if (now() > record.resetTokenExpiresAt) break;
        // Single use: the record goes away with the token.
        records.delete(key);
        return { ok: true, userId: record.userId };
      }
    }
    return { ok: false, err: "RESET_TOKEN_INVALID" };
  };

  const size = () => records.size;

  return { requestReset, verifyCode, consumeResetToken, size };
};

module.exports = {
  createPasswordResetStore,
  normalizeEmail,
  isValidEmail,
  validatePasswordPolicy,
};
