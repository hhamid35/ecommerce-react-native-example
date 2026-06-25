import network from "../constants/Network";

const FALLBACK_MESSAGES = {
  request: "Unable to send recovery code",
  verify: "Invalid or expired code. Request a new one.",
  reset: "Recovery session expired. Please start again.",
};

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function parseResponse(response, fallbackMessage) {
  let result;
  try {
    result = await response.json();
  } catch {
    return {
      ok: false,
      status: response.status,
      message: fallbackMessage,
      data: {},
    };
  }
  return {
    ok: result.success === true,
    status: response.status,
    message: result.message || fallbackMessage,
    data: result.data || {},
  };
}

/**
 * @returns {Promise<{ ok: boolean, status: number, message: string, data: object }>}
 */
export async function requestRecoveryCode(email) {
  const normalized = normalizeEmail(email);
  try {
    const response = await fetch(`${network.serverip}/password-recovery/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalized }),
    });
    return parseResponse(response, FALLBACK_MESSAGES.request);
  } catch {
    return { ok: false, status: 0, message: "Network error", data: {} };
  }
}

/**
 * @returns {Promise<{ ok: boolean, status: number, message: string, data: object }>}
 */
export async function verifyRecoveryCode(email, otp) {
  const normalized = normalizeEmail(email);
  try {
    const response = await fetch(`${network.serverip}/password-recovery/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalized, otp }),
    });
    return parseResponse(response, FALLBACK_MESSAGES.verify);
  } catch {
    return { ok: false, status: 0, message: "Network error", data: {} };
  }
}

/**
 * @returns {Promise<{ ok: boolean, status: number, message: string, data: object }>}
 */
export async function resetPasswordWithToken({ email, resetToken, newPassword, confirmPassword }) {
  const normalized = normalizeEmail(email);
  try {
    const response = await fetch(`${network.serverip}/password-recovery/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalized,
        resetToken,
        newPassword,
        confirmPassword,
      }),
    });
    return parseResponse(response, FALLBACK_MESSAGES.reset);
  } catch {
    return { ok: false, status: 0, message: "Network error", data: {} };
  }
}
