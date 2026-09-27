# Business Spec: Secure account recovery (hhamid35/ecommerce-react-native-example#3)

> Jira Epic: [hhamid35/ecommerce-react-native-example#3](https://github.com/hhamid35/ecommerce-react-native-example/issues/3)
> Reporter: hhamid35 · Story points: Not estimated
> Labels: epic

## Product summary

EasyBuy shoppers and admins who forget their password have no way back into their account today. This feature replaces the placeholder "Forgot password" screen with a full, secure recovery journey:

1. The user asks for a reset using their email.
2. They receive a time-limited one-time code or link.
3. They choose a new password that meets clear rules.
4. They are guided back to login with clear success or failure messages at every step.

The outcome: fewer locked-out customers, fewer abandoned carts and support requests, and a recovery process that cannot be used to take over someone else's account.

## Business problem

Original Epic requirement (hhamid35/ecommerce-react-native-example#3), verbatim:

> Replace the placeholder "forgot password" flow with an end-to-end recovery path: user requests a reset with email, receives a time-limited token link or OTP, sets a new password with validation, and is guided back to login with success and failure messaging.

What the product does today:

- **The Forgot password screen does nothing.** The login screen links to a "Reset Password" screen with an email field and a "Send Instruction" button, but the button is a placeholder. It does not even read the email the user typed. The user gets no feedback, and no email is ever sent.
- **There is no recovery path at all.** The only password change the app supports is for users who are already signed in and know their current password. A user who has forgotten their password is stuck. Their only options are to contact support or create a new account, which loses their order history and wishlist.
- **The app cannot send email.** Neither the app nor the local development backend can send email today. There is also no way to open the app from a link in an email. Both would be new.
- **Password rules are inconsistent.** Sign-up and login enforce slightly different minimum lengths, and one of the error messages is misleading. If recovery introduced a third rule, users would be confused and could create passwords they then can't use to sign in.

Business impact: locked-out customers can't complete purchases or track orders, support load goes up, and trust in the product drops. A weak recovery process is also a common way attackers take over accounts.

## Goals and non-goals

- **Goal:** Any registered user (shopper or admin) who has forgotten their password can get back into their account on their own, without contacting support.
- **Goal:** Recovery is secure. Only the person who controls the account's email can reset the password. Reset codes or links expire, work once only, and resist guessing.
- **Goal:** Recovery does not reveal whether an email address is registered.
- **Goal:** The new password follows one consistent set of rules, shared with sign-up and the signed-in "Update password" screen.
- **Goal:** Clear, friendly messages at every step, including when something goes wrong (expired code, wrong code, mismatched passwords, network offline). The user always ends up back at login with a clear next action.
- **Goal:** The journey works the same on iOS, Android and web. It also works against the local development backend, so it can be demonstrated and tested without real email.
- **Non-goal:** Recovery by SMS or phone number, social login, or passkeys / multi-factor authentication.
- **Non-goal:** Admin-initiated resets or unlocking accounts on a user's behalf.
- **Non-goal:** Changing the email address on an account, or recovering an account whose email the user no longer has access to (this stays with support).
- **Non-goal:** Redesigning the existing signed-in "Update password" screen, apart from bringing its password rules in line.
- **Non-goal:** Building a general notifications or marketing email capability. Only the reset message is in scope.

## Personas and users

- **Shopper (registered customer):** The main user. They have forgotten their password, often at a moment when they want to buy. They need a fast, clear path back to their cart, orders and wishlist.
- **Store admin:** Uses the same login screen and can also lose access. Because admins control products, orders and users, their accounts are the most valuable targets. They must get the same secure recovery, with no shortcuts.
- **Support team:** Currently handles locked-out users by hand. They benefit from fewer tickets and need clear messaging they can point users to.
- **Product Owner / business:** Accountable for conversion and account security. Decides on the recovery method, how long codes or links last, and password rules.
- **Developers and QA:** Need a way to see the reset code or link during local development without a real mail server, so they can demo and test the flow end to end.

## Business requirements

- **BR-1 Request a reset by email:** From the login screen, a user can open "Forgot password", enter their email, and submit a reset request. The app checks that the email looks valid before sending.
- **BR-2 Neutral response:** After a request, the app always shows the same confirmation (for example, "If an account exists for this email, we've sent reset instructions"), whether or not the email is registered. This stops anyone using the screen to find out who has an account.
- **BR-3 Deliver a time-limited secret:** The account's registered email receives a one-time reset code or link (method decided in Q-1). It expires after a set time (Q-2) and can be used only once.
- **BR-4 Latest request wins:** Requesting a new reset cancels any earlier, unused code or link for that account.
- **BR-5 Verify before reset:** The user can set a new password only after the code or link has been checked as valid, unexpired and unused.
- **BR-6 Limit guessing:** Wrong code attempts are limited per request, and repeated reset requests for the same email are throttled. After the limit, the user must request a new code.
- **BR-7 Set a new password with validation:** The user enters and confirms a new password. The app checks it against the single shared password rule (Q-3) and that both entries match, with a clear message for each failure. The same rule applies at sign-up and on the signed-in "Update password" screen.
- **BR-8 Secure storage:** The new password is stored securely and never sent back or displayed.
- **BR-9 Session hygiene after reset:** After a successful reset, the old password no longer works, and existing signed-in sessions on other devices stop working (assumption A-4). The user is not signed in automatically.
- **BR-10 Guided return to login:** After a successful reset, the user sees a success message and is taken to the login screen, ready to sign in with the new password.
- **BR-11 Failure messaging:** Every failure (invalid email format, expired code or link, wrong or already-used code, too many attempts, weak password, mismatched passwords, network offline, server unavailable) shows a plain-language message and a clear next step, such as "Request a new code" or "Try again".
- **BR-12 Resend and back navigation:** The user can request a new code from the verification step (subject to throttling) and can go back to login from any step.
- **BR-13 Development parity:** The local development backend supports the full journey and shows the code or link to developers in its log instead of sending real email.
- **BR-14 Cross-platform:** The journey works on iOS, Android and web with the same steps and wording.
- **BR-15 Accessibility and testability:** Every new screen element can be tested automatically, following the pattern the existing screens use, and the flow is usable with screen readers.

## Acceptance criteria

The Epic states no formal acceptance criteria. The criteria below are derived directly from each clause of the Epic requirement, marked [Epic], plus the security needs recorded above.

1. [Epic: "replace the placeholder"] Given a user on the login screen, when they tap "Forgot password", they reach a working recovery screen. Submitting it now does something and gives feedback; it is no longer a dead button.
2. [Epic: "requests a reset with email"] Given the user enters a badly formatted or empty email, when they submit, they see a validation message and no request is sent.
3. [Epic: "requests a reset with email"] Given the user enters a well-formed email, when they submit, they see the same neutral confirmation whether or not the email is registered, and they move on to the next step.
4. [Epic: "receives a time-limited token link or OTP"] Given a registered email, when a reset is requested, a one-time code or link is sent to that email (or shown in the log in local development) that expires after the agreed time.
5. [Epic: "time-limited"] Given a code or link that has expired, been used, or been replaced by a newer request, when the user tries to use it, they see a clear "expired or invalid" message and an option to request a new one. The password is not changed.
6. [Security] Given a user enters a wrong code more than the allowed number of times, further attempts on that request are rejected and the user is told to request a new code.
7. [Epic: "sets a new password with validation"] Given a valid code or link, when the user enters a new password that breaks the password rule or doesn't match the confirmation, they see a specific message and the password is not changed.
8. [Epic: "sets a new password with validation"] Given a valid code or link and a new password that meets the rule, when the user submits, the password is updated. After that the old password no longer works and the code or link cannot be used again.
9. [Epic: "guided back to login with success messaging"] Given a successful reset, the user sees a success message, lands on the login screen, and can sign in straight away with the new password.
10. [Epic: "failure messaging"] Given the device is offline or the server can't be reached at any step, the user sees a plain-language error and can retry without losing what they typed.
11. [Consistency] The same password rule is enforced at sign-up, during recovery, and on the signed-in "Update password" screen, with matching wording.
12. [Parity] The full journey can be completed on iOS, Android and web against the local development backend.

## Assumptions and constraints

- **A-1 Recovery method (pending Q-1):** Working assumption: a short numeric one-time code, emailed to the user and typed into the app. The app has no way to be opened from an email link today, and a code works the same on iOS, Android and web.
- **A-2 Lifetime and limits (pending Q-2):** Working assumption: the code expires after 15 minutes and allows 5 wrong attempts, with at most one new request per minute per email.
- **A-3 Password rule (pending Q-3):** Working assumption: at least 8 characters, including at least one letter and one number. The same rule applies everywhere passwords are set.
- **A-4 Other sessions:** A successful reset signs the user out of any other devices. The user is not signed in automatically; they return to login.
- **A-5 Existing accounts:** Existing users are not forced to change passwords that don't meet a new, stricter rule. The rule applies only when a password is next set.
- **A-6 One recovery flow for both roles:** Shoppers and admins use the same flow and the same security limits.
- **A-7 English only:** Messages are in English, matching the rest of the app.
- **C-1 Separate real backend:** The production backend is maintained outside this repository. This repository contains only the mobile app and a local development backend, so real email delivery and securely stored reset codes must also be delivered on the production backend.
- **C-2 Local development backend:** The local backend keeps data in memory and stores passwords in plain text. It is for demos and tests only and must not be taken as the security model for production.
- **C-3 Existing conventions:** New screens reuse the app's existing inputs, buttons, alert messages and offline banner so the flow looks and behaves like the rest of the app.

## Dependencies

- **Production backend team:** Must provide the ability to request, check and complete a reset. This includes secure storage of reset codes, expiry, attempt limits and cancelling sessions after a reset.
- **Email delivery provider:** A transactional email service (and a verified sender domain) is needed to send reset messages in production. None is in place today.
- **Email content and branding:** Approved subject line, wording and branding for the reset email, plus the in-app messages, from Product or Marketing.
- **Security review:** Sign-off on the code or link lifetime, attempt limits and password rule before release.
- **Only if links are chosen (Q-1):** Setting up the app so it opens from a link, plus a web fallback page. This adds app-store and domain configuration work.
- **Organizational context (to verify):** The enterprise knowledge graph points to related items ("AL-2: account recovery must be secure" and "AL-14: validate the recovery token or OTP before allowing a reset", which has four acceptance criteria). Only one of those criteria could be retrieved. The PO should confirm these items and their full criteria in the source tracker and add any missing criteria to this spec.

## Risks

- **Account takeover through weak recovery:** Guessable, reusable or long-lived codes would let attackers take over accounts, especially admin accounts. *Mitigation:* codes or links that work once, expire quickly, and have limited attempts and throttled requests (BR-3 to BR-6). Security review is a release gate.
- **Revealing who has an account:** Different messages for known and unknown emails would let anyone check who shops at EasyBuy. *Mitigation:* always show the same neutral response (BR-2).
- **Email reliability:** Reset emails that are delayed or go to spam look like a broken feature and drive support tickets. *Mitigation:* a reputable provider, a verified sender, a resend option, and "check your spam folder" guidance.
- **Production backend not ready in time:** The app work can be finished against the local backend, but it cannot go live without production backend support. *Mitigation:* agree the behaviour with the backend team early and ship the app change behind that dependency.
- **Inconsistent password rules:** A stricter recovery rule that sign-up and login don't share could leave users with passwords the app rejects elsewhere. *Mitigation:* one shared rule and matching wording (BR-7, AC-11).
- **Link-based recovery complexity (if chosen):** Links that don't open the app on some devices, or open on a different device from the one the user is on, cause failed resets. *Mitigation:* prefer a code (Q-1), or provide a web fallback.
- **Existing password-change weakness (adjacent):** The current signed-in password change has weak protections in the local development backend. It is out of scope here but should be reviewed on the production backend, so recovery doesn't sit next to an easier way in.

## Open questions

- **Q-1 Recovery method:** Emailed code typed into the app (recommended), emailed link that opens the app, or both? This determines the screens, the email content, and whether link setup is needed.
- **Q-2 Code/link lifetime and attempt limits:** 15 minutes and 5 attempts (recommended), a stricter 10 minutes and 3 attempts, or a more lenient 60 minutes?
- **Q-3 Password rule:** At least 8 characters with a letter and a number (recommended), keep the current 6-character minimum, or a stricter rule with upper/lower case, number and symbol?
- **Non-blocking, assumed unless the PO objects:** signing out other devices after a reset (A-4) and not forcing existing users to upgrade weak passwords (A-5).
- **Non-blocking:** Confirm the full acceptance criteria of the related items AL-2 and AL-14 (see Dependencies).

## Initial implementation plan

1. **Confirm decisions:** The PO answers Q-1 to Q-3, and Security signs off on the limits.
2. **Agree the backend behaviour:** Align with the production backend team on requesting a reset, checking the code, setting the new password and signing out sessions. Choose and set up the email provider and approve the email content.
3. **Local development backend:** Add the full recovery journey to the local backend, showing the code or link in its log, so the app can be built and tested end to end without real email.
4. **App journey:** Replace the placeholder screen with a working flow: request with email → neutral confirmation → enter code (or open link) → set and confirm new password → success → back to login. Include resend, back navigation, offline handling and every failure message.
5. **Unify password rules:** Apply the single password rule and wording to sign-up, recovery and the signed-in "Update password" screen.
6. **Quality:** Add automated tests for the happy path and each failure case, run on iOS, Android and web, and do a security review of the finished flow.
7. **Release:** Ship once the production backend and email delivery are live. Monitor reset request and success rates and support ticket volume.

## Validation summary

All twelve required sections are present, with concrete content and no placeholders. The Epic has no formal acceptance criteria, so each clause of the Epic text has been turned into a testable criterion (AC-1 to AC-12). The draft is grounded in the current product:

- The Forgot password screen exists but is non-functional.
- A signed-in password change exists but requires the current password.
- No email sending or open-from-link support exists.
- Password rules are inconsistent today.

Three non-blocking decisions (Q-1 recovery method, Q-2 lifetime and limits, Q-3 password rule) have working assumptions recorded (A-1 to A-3), so Design can start. The answers may adjust the screens and acceptance criteria. The related organizational items AL-2 and AL-14 are leads and should be verified in the source tracker.