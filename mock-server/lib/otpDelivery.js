const OTP_DELIVERY_MODE = process.env.OTP_DELIVERY_MODE || "mock";
const IS_MOCK_DELIVERY = process.env.NODE_ENV !== "production";

function maskEmail(email) {
  const atIndex = email.indexOf("@");
  if (atIndex <= 1) {
    return email;
  }
  return `${email[0]}***${email.slice(atIndex)}`;
}

/**
 * @param {{ email: string, otp: string }} params
 * @returns {Promise<void>}
 */
async function deliverOtp({ email, otp }) {
  if (OTP_DELIVERY_MODE === "email") {
    console.log(`email_dispatch_pending: to=${maskEmail(email)} otp_length=${otp.length}`);
    return;
  }
  console.log(`dev_otp_issued: email=${email} otp=${otp}`);
}

module.exports = {
  deliverOtp,
  IS_MOCK_DELIVERY,
  OTP_DELIVERY_MODE,
};
