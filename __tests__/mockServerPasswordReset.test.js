const {
  createPasswordResetStore,
  normalizeEmail,
  isValidEmail,
  validatePasswordPolicy,
} = require("../mock-server/passwordReset");
import { validatePassword } from "../utils/passwordPolicy";

const MINUTE = 60 * 1000;
const user = { _id: "user001", email: "user@easybuy.com" };

// A controllable clock plus a store whose delivered codes we can read back.
const setup = (options = {}) => {
  let time = 1_000_000;
  const clock = {
    now: () => time,
    advance: (ms) => {
      time += ms;
    },
  };
  const deliver = jest.fn();
  const store = createPasswordResetStore({ now: clock.now, deliver, ...options });
  const lastCode = () => deliver.mock.calls[deliver.mock.calls.length - 1][1];
  return { store, clock, deliver, lastCode };
};

const wrongCode = (code) => (code === "000000" ? "111111" : "000000");

describe("mock-server password reset store", () => {
  it("delivers a code, exchanges it for a token, and consumes the token", () => {
    const { store, deliver, lastCode, clock } = setup();
    expect(store.requestReset(" User@EasyBuy.com ", user)).toEqual({ ok: true });
    expect(deliver).toHaveBeenCalledTimes(1);
    const [email, code, expiresAt] = deliver.mock.calls[0];
    expect(email).toBe("user@easybuy.com");
    expect(code).toMatch(/^[0-9]{6}$/);
    expect(expiresAt).toBe(clock.now() + 15 * MINUTE);

    const verified = store.verifyCode("user@easybuy.com", lastCode());
    expect(verified.ok).toBe(true);
    expect(verified.resetToken).toMatch(/^[0-9a-f]{64}$/);
    expect(verified.expiresAt).toBe(clock.now() + 10 * MINUTE);

    expect(store.consumeResetToken(verified.resetToken)).toEqual({
      ok: true,
      userId: "user001",
    });
    expect(store.size()).toBe(0);
  });

  it("rejects a wrong code and locks on the 5th wrong attempt", () => {
    const { store, lastCode } = setup();
    store.requestReset(user.email, user);
    const code = lastCode();
    for (let i = 0; i < 4; i++) {
      expect(store.verifyCode(user.email, wrongCode(code))).toEqual({
        ok: false,
        err: "RESET_CODE_INVALID",
      });
    }
    expect(store.verifyCode(user.email, wrongCode(code))).toEqual({
      ok: false,
      err: "RESET_ATTEMPTS_EXCEEDED",
    });
    // Even the correct code is rejected once locked.
    expect(store.verifyCode(user.email, code)).toEqual({
      ok: false,
      err: "RESET_ATTEMPTS_EXCEEDED",
    });
  });

  it("expires the code after 15 minutes", () => {
    const { store, lastCode, clock } = setup();
    store.requestReset(user.email, user);
    clock.advance(15 * MINUTE + 1);
    expect(store.verifyCode(user.email, lastCode())).toEqual({
      ok: false,
      err: "RESET_CODE_EXPIRED",
    });
  });

  it("accepts the code right up to its expiry", () => {
    const { store, lastCode, clock } = setup();
    store.requestReset(user.email, user);
    clock.advance(15 * MINUTE);
    expect(store.verifyCode(user.email, lastCode()).ok).toBe(true);
  });

  it("throttles repeat requests within 60 seconds", () => {
    const { store, clock, deliver } = setup();
    store.requestReset(user.email, user);
    clock.advance(23 * 1000);
    expect(store.requestReset(user.email, user)).toEqual({
      ok: false,
      err: "RESET_THROTTLED",
      retryAfterSeconds: 37,
    });
    expect(deliver).toHaveBeenCalledTimes(1);
    clock.advance(37 * 1000);
    expect(store.requestReset(user.email, user)).toEqual({ ok: true });
    expect(deliver).toHaveBeenCalledTimes(2);
  });

  it("lets the newest request replace the previous code", () => {
    const { store, clock, deliver } = setup();
    store.requestReset(user.email, user);
    const firstCode = deliver.mock.calls[0][1];
    clock.advance(MINUTE);
    store.requestReset(user.email, user);
    const secondCode = deliver.mock.calls[1][1];
    if (firstCode !== secondCode) {
      expect(store.verifyCode(user.email, firstCode)).toEqual({
        ok: false,
        err: "RESET_CODE_INVALID",
      });
    }
    expect(store.verifyCode(user.email, secondCode).ok).toBe(true);
    expect(store.size()).toBe(1);
  });

  it("treats a code already exchanged for a token as expired", () => {
    const { store, lastCode } = setup();
    store.requestReset(user.email, user);
    const code = lastCode();
    expect(store.verifyCode(user.email, code).ok).toBe(true);
    expect(store.verifyCode(user.email, code)).toEqual({
      ok: false,
      err: "RESET_CODE_EXPIRED",
    });
  });

  it("allows a reset token to be used only once", () => {
    const { store, lastCode } = setup();
    store.requestReset(user.email, user);
    const { resetToken } = store.verifyCode(user.email, lastCode());
    expect(store.consumeResetToken(resetToken).ok).toBe(true);
    expect(store.consumeResetToken(resetToken)).toEqual({
      ok: false,
      err: "RESET_TOKEN_INVALID",
    });
  });

  it("expires the reset token after 10 minutes", () => {
    const { store, lastCode, clock } = setup();
    store.requestReset(user.email, user);
    const { resetToken } = store.verifyCode(user.email, lastCode());
    clock.advance(10 * MINUTE + 1);
    expect(store.consumeResetToken(resetToken)).toEqual({
      ok: false,
      err: "RESET_TOKEN_INVALID",
    });
  });

  it("rejects unknown or missing reset tokens", () => {
    const { store } = setup();
    expect(store.consumeResetToken("f".repeat(64))).toEqual({
      ok: false,
      err: "RESET_TOKEN_INVALID",
    });
    expect(store.consumeResetToken(undefined)).toEqual({
      ok: false,
      err: "RESET_TOKEN_INVALID",
    });
  });

  it("returns RESET_CODE_INVALID when no reset was requested", () => {
    const { store } = setup();
    expect(store.verifyCode("nobody@easybuy.com", "123456")).toEqual({
      ok: false,
      err: "RESET_CODE_INVALID",
    });
  });

  describe("unregistered emails", () => {
    const email = "ghost@easybuy.com";

    it("responds identically but never delivers a code", () => {
      const { store, deliver } = setup();
      expect(store.requestReset(email, null)).toEqual({ ok: true });
      expect(deliver).not.toHaveBeenCalled();
    });

    it("never verifies and locks after 5 attempts", () => {
      const { store } = setup();
      store.requestReset(email, null);
      for (let i = 0; i < 4; i++) {
        expect(store.verifyCode(email, String(i).padStart(6, "0"))).toEqual({
          ok: false,
          err: "RESET_CODE_INVALID",
        });
      }
      expect(store.verifyCode(email, "999999")).toEqual({
        ok: false,
        err: "RESET_ATTEMPTS_EXCEEDED",
      });
    });

    it("is throttled exactly like a registered email", () => {
      const { store, clock } = setup();
      store.requestReset(email, null);
      store.requestReset(user.email, user);
      clock.advance(10 * 1000);
      expect(store.requestReset(email, null)).toEqual(
        store.requestReset(user.email, user)
      );
    });
  });

  it("never produces the jwt expired error", () => {
    const { store } = setup();
    const results = [
      store.verifyCode(user.email, "123456"),
      store.consumeResetToken("x"),
    ];
    results.forEach((r) => expect(r.err).not.toBe("jwt expired"));
  });

  describe("helpers", () => {
    it("normalizes and validates emails like the app", () => {
      expect(normalizeEmail("  A@B.Com ")).toBe("a@b.com");
      expect(isValidEmail("user@easybuy.com")).toBe(true);
      expect(isValidEmail("user@easybuy")).toBe(false);
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail(`${"a".repeat(250)}@b.com`)).toBe(false);
    });

    it.each([
      "",
      "abcdef1",
      "abcdefgh",
      "12345678",
      "abcdefg1",
      "ABCDEFG1",
      `a1${"b".repeat(126)}`,
      `a1${"b".repeat(127)}`,
    ])("validatePasswordPolicy agrees with the app rule for %p", (password) => {
      expect(validatePasswordPolicy(password)).toBe(validatePassword(password));
    });
  });
});
