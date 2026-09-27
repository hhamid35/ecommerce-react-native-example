# Business Spec: Checkout & Payments Beyond Cash-on-Delivery (hhamid35/ecommerce-react-native-example#2)

> Jira Epic: [hhamid35/ecommerce-react-native-example#2](https://github.com/hhamid35/ecommerce-react-native-example/issues/2)
> Reporter: hhamid35 · Story points: Not estimated
> Labels: epic

## Product summary

EasyBuy shoppers can pay only by cash on delivery (COD) today. This feature adds **at least one digital payment option** at checkout, alongside COD. Every order will record **how** it was paid and **whether** it has been paid. The order confirmation screen, the shopper's order history, and the admin order views will all show that payment information.

The digital option is a **simulated (mock) payment experience**. It shows the full "pay now" journey, including success, decline, and cancel, without moving real money. That lets the business test the experience with users, and prepare order records for a real payment provider, before signing a provider contract.

## Business problem

The Epic (hhamid35/ecommerce-react-native-example#2) asks us to:

> "Extend checkout so users can choose at least one digital payment path (e.g. card placeholder, "pay with wallet" mock, or redirect-style flow) in addition to COD. Orders store payment method and status; confirmation and order history reflect payment state"

What the product does today:

- **Checkout offers no choice.** The Payment section always reads "Cash On Delivery", and every order is sent as COD. Shoppers who expect to pay up front, which is standard in modern e-commerce, cannot.
- **Orders record the payment method but not payment status.** Nobody can tell whether an order has been paid. The only status is the delivery status (pending, shipped, delivered).
- **Confirmation says nothing about payment.** After placing an order the shopper sees a generic "order confirmed" message, with no order number, amount, payment method, or payment outcome.
- **Order history and admin views show delivery status only.** Shoppers can't check whether they owe money at the door. Admins can't tell prepaid orders from orders that still need cash collected.
- **A failed order submission gives no feedback.** If an order can't be placed, the progress indicator just closes with no explanation. A payment step adds new ways to fail, such as declines and cancellations, so this gap gets worse.

Business impact: shoppers abandon carts when their preferred way to pay isn't offered, cash collection can't be reconciled, and the business can't start integrating a real provider until orders can hold payment state.

## Goals and non-goals

- **Goal:** Let shoppers choose between COD and at least one digital payment option at checkout. COD stays available and stays the default.
- **Goal:** Record a payment method and a payment status on every new order, separate from its delivery status.
- **Goal:** Simulate a realistic digital payment journey (success, decline, cancel) so the experience can be tested end to end without a live provider.
- **Goal:** Show payment method and payment status on the order confirmation, in the shopper's order list and order detail, and in the admin order list and order detail.
- **Goal:** Tell shoppers clearly when payment or order placement fails, keep their cart, and let them retry or switch to COD.
- **Goal:** Make sure orders created before this feature still display correctly (as COD).
- **Non-goal:** Connecting to a real payment provider, charging real cards, or moving real money.
- **Non-goal:** Storing real card numbers or any sensitive payment credentials, now or as part of this work.
- **Non-goal:** Refunds, partial payments, split payments, saved payment methods, promo codes, or discounts.
- **Non-goal:** Delivery-fee calculation, tax, or multiple currencies.
- **Non-goal:** Changing the existing delivery statuses (pending, shipped, delivered).

## Personas and users

- **Shopper (signed-in customer):** Chooses a payment method at checkout, goes through the simulated digital payment if they pick it, and sees what happened to their payment on the confirmation screen and in order history. Main beneficiary.
- **Store administrator:** Sees each order's payment method and payment status in the admin order list and detail. Can tell prepaid orders from orders that need cash collected, and can confirm cash was received for COD orders.
- **Product Owner / business stakeholder:** Uses the simulated flow to check the checkout experience and conversion before choosing a real payment provider.
- **Backend / integration team (supporting):** Must add payment method and payment status to orders in the real backend so the app behaves the same against the mock server and the production backend.

## Business requirements

- **BR-1 (Payment choice):** Checkout lists the available payment methods: Cash on Delivery plus at least one digital option. The shopper must pick exactly one. COD is pre-selected, so today's one-tap path still works.
- **BR-2 (Digital payment journey):** When the shopper picks the digital option and submits, they go through a clearly labelled simulated payment step. It can end three ways: **success**, **declined**, or **cancelled by the shopper**. The step must say plainly that it is a demo and no real money is charged.
- **BR-3 (No sensitive data):** The simulated step must not ask for, store, or send real card numbers, security codes, or wallet credentials. Any fields it shows are placeholders or clearly marked test values.
- **BR-4 (Payment method on the order):** Every new order records the payment method the shopper chose.
- **BR-5 (Payment status on the order):** Every new order records a payment status separate from its delivery status. It has at least these values: **Pending** (payment expected later, as with COD), **Paid**, and **Failed**.
- **BR-6 (Initial payment status rules):** A COD order starts as payment **Pending**. A successful digital payment gives an order with payment **Paid**. A declined or cancelled digital payment does not create a paid order and never empties the cart (see Q-2 for whether a failed attempt is kept on record).
- **BR-7 (COD settlement):** An administrator can mark a COD order as **Paid** once cash is collected. (Working assumption; the Design stage will confirm whether this is automatic on delivery or a separate admin action.)
- **BR-8 (Confirmation reflects payment):** After a successful order, the confirmation screen shows the order reference, total amount, payment method, and payment status. For example, "Paid by card (demo)" or "Pay cash on delivery".
- **BR-9 (Shopper order history reflects payment):** The shopper's order list and order detail show each order's payment method and payment status next to its delivery status.
- **BR-10 (Admin views reflect payment):** The admin order list and order detail show payment method and payment status. Admins can tell unpaid orders from paid ones at a glance.
- **BR-11 (Clear failure feedback):** If payment is declined or cancelled, or the order can't be placed, the shopper sees a clear message saying what happened and what to do next. The cart is kept, and they can retry or switch to COD.
- **BR-12 (No double charging or duplicate orders):** Tapping submit repeatedly, or going back during the payment step, must not create duplicate orders or charge twice.
- **BR-13 (Existing orders):** Orders placed before this release have no payment status. They display as Cash on Delivery with a sensible default status (Pending, or Paid if already delivered). They must never show blank or broken fields.
- **BR-14 (Parity across backends):** The behaviour works against the local demo backend used for development. The real backend is updated with the same information so production behaves the same way.
- **BR-15 (Platforms):** The payment choice and simulated payment step work on the app's supported platforms (iOS, Android, and web).
- **BR-16 (Accessibility and testability):** The new payment options and statuses are readable by screen readers and can be targeted by automated tests, in line with the existing screens.

## Acceptance criteria

The Epic has no formal acceptance criteria. The criteria below come directly from the Epic description; each is traced to its source phrase.

1. *(Epic: "users can choose at least one digital payment path … in addition to COD")* When a signed-in shopper opens checkout with items in their cart, they see Cash on Delivery and at least one digital payment option. COD is selected by default and they can switch to the digital option before submitting.
2. *(Epic: "digital payment path")* When the shopper picks the digital option and submits, a simulated payment step appears. It is clearly labelled as a demo and lets the shopper finish with a successful payment, a declined payment, or a cancellation.
3. *(Epic: "digital payment path")* When the simulated payment succeeds, the order is placed, the cart is emptied, and the shopper lands on the confirmation screen.
4. *(Derived edge case)* When the simulated payment is declined or cancelled, no paid order is created. The cart is unchanged, the shopper sees a clear message, and they can retry or switch to Cash on Delivery.
5. *(Epic: "in addition to COD")* A shopper who keeps Cash on Delivery can place an order exactly as today, with no extra steps.
6. *(Epic: "Orders store payment method and status")* Every order placed after release records its payment method (COD or the digital option) and a payment status. COD orders start as Pending; successful digital payments are Paid.
7. *(Epic: "confirmation … reflect[s] payment state")* After a successful order, the confirmation screen shows the order reference, total, payment method, and payment status.
8. *(Epic: "order history reflect[s] payment state")* In My Orders and the order detail screen, every order shows its payment method and payment status next to its delivery status.
9. *(Derived: admin visibility)* In the admin order list and order detail, every order shows its payment method and payment status. An admin can record that cash was collected for a COD order, which changes its payment status to Paid.
10. *(Derived: data continuity)* Orders created before this release show as Cash on Delivery with a sensible payment status. No blank or broken payment fields appear anywhere.
11. *(Derived: safety)* The app never asks for or stores real card or wallet credentials. Tapping submit several times or navigating back during payment never creates duplicate orders.
12. *(Derived: quality gate)* Automated tests cover the new payment choice, the three payment outcomes, and how payment status is shown. Lint and the existing test suite pass.

## Assumptions and constraints

- **Assumption:** "Digital payment" means a **simulated** payment in this Epic. No real payment provider, merchant account, or live money movement is in scope. (Epic examples: "card placeholder", "pay with wallet mock", "redirect-style flow".)
- **Assumption:** One digital option is enough for this release. The recommended one is a demo card form, pending Q-1. Checkout must be designed so more methods can be added later.
- **Assumption:** Payment status is separate from delivery status. An order can be, for example, "Shipped" and "Pending payment" (COD) at the same time.
- **Assumption:** Payment status values are Pending, Paid, and Failed at minimum. Refunded and other states come later.
- **Assumption:** For COD, an administrator records cash collection (BR-7). The Design stage may also mark COD orders Paid automatically when they are marked Delivered.
- **Assumption:** The order total the shopper pays is the current cart total. Delivery cost stays at zero, as today.
- **Constraint:** Checkout already has a Payment section that shows COD. The new choice should replace that fixed label rather than add a separate screen, so the checkout layout stays familiar.
- **Constraint:** The app runs against a local demo backend in development and a separate real backend in production. Both must understand payment method and payment status.
- **Constraint:** The app ships on iOS, Android, and web from one codebase. The simulated payment step must work on all three.
- **Constraint:** No sensitive payment data may be collected, stored, or logged (BR-3).
- **Constraint:** Existing checkout, order history, and admin order screens have automated-test hooks that current tests depend on. They must keep working.

## Dependencies

- **Real backend team / service:** The production backend is outside this repository. It must store payment method and payment status on orders and let admins update payment status. Until it does, the feature can only be fully checked against the demo backend.
- **Local demo backend:** Must support the new payment information and simulate success, decline, and cancel outcomes, so the app can be built and tested now.
- **Product/UX decision:** Which digital option(s) to offer and how the simulated step looks (Q-1).
- **Business decision:** What happens to a failed or cancelled payment attempt (Q-2), and whether the real backend is updated in this Epic (Q-3).
- **Future (out of scope):** Choosing a real payment provider, with its contract and compliance review, is needed before any live payments. This Epic prepares for that but doesn't depend on it.

## Risks

- **Shoppers mistake the demo for a real payment:** They might think they were charged, or enter real card details. *Mitigation:* clear "Demo — no money is charged" labelling, placeholder or test-only fields, and no storage of what they type (BR-2, BR-3).
- **Front end and backends drift apart:** The app could show payment status that the real backend never saves, so production shows blank or wrong payment info. *Mitigation:* agree the payment information with the backend team early (Q-3) and default old or missing values safely (BR-13).
- **Duplicate orders or double "charges"**, from repeated taps, slow networks, or going back mid-payment. That means customer-service cost and lost trust. *Mitigation:* BR-12, plus explicit tests for repeated submits.
- **Carts lost on failure:** If the cart empties when payment fails, shoppers must rebuild it and may leave. *Mitigation:* the cart is emptied only after a confirmed successful order (BR-6, BR-11).
- **Existing orders look broken** because they have no payment status. *Mitigation:* a defined default display for older orders (BR-13, AC-10).
- **Confusing paid with delivered:** Admins could misread a single combined status. *Mitigation:* show payment status and delivery status as two separate, clearly labelled values.
- **Scope creep toward a real provider**, such as refunds or saved cards, delaying delivery. *Mitigation:* the explicit non-goals above. Real-provider work becomes a follow-up Epic.
- **Hardcoded contact details at checkout:** Checkout currently shows fixed contact details that aren't the shopper's. That can look wrong next to a payment step. *Mitigation:* flagged as a known issue for the PO to prioritise; not required by this Epic.

## Open questions

- **Q-1 (Digital option to offer):** Which simulated digital payment experience should ship first: demo card form, "pay with wallet" mock, or a redirect-style hosted-page simulation? *Working assumption:* demo card form.
- **Q-2 (Failed payment handling):** When a digital payment is declined or cancelled, should nothing be recorded (shopper retries from the cart), or should an order be kept with payment status "Failed" that the shopper can retry? *Working assumption:* no order is recorded and the cart is kept.
- **Q-3 (Real backend scope):** Is updating the real production backend part of this Epic, or does this Epic cover only the app and demo backend, with a written hand-off to the backend team? *Working assumption:* the app and demo backend are in scope, with a hand-off for the real backend.
- **Non-blocking — COD settlement trigger:** Should a COD order become Paid automatically when it's marked Delivered, or only when an admin records it separately? The Design stage can decide; the working assumption is recorded in BR-7.

## Initial implementation plan

1. **Confirm scope decisions** (Q-1 to Q-3) with the Product Owner. Agree with the backend team what payment information orders will carry.
2. **Add payment information to orders:** payment method and payment status. Define safe defaults for existing orders. Update the local demo backend to accept, store, and return it, and to simulate success, decline, and cancel.
3. **Turn checkout's fixed Payment section into a payment choice:** COD stays the default, alongside the digital option.
4. **Build the simulated digital payment step,** with clear demo labelling, the three outcomes, protection against duplicate submission, and clear failure messages that keep the cart.
5. **Improve the order confirmation screen** to show order reference, total, payment method, and payment status.
6. **Show payment details in the shopper's order list and order detail,** next to delivery status.
7. **Show payment details in the admin order list and order detail,** and add a way for admins to record cash collected for COD orders.
8. **Hand off the real-backend changes** (or build them, depending on Q-3) so production matches the demo backend.
9. **Test and check on at least one platform:** automated tests for payment selection, outcomes, and display; lint and existing tests passing; manual check of COD and digital journeys on iOS/Android/web.

## Validation summary

All twelve required sections are present and filled in with concrete content drawn from the Epic and a review of the current checkout, order confirmation, order history, and admin order capabilities. The Epic has no formal acceptance criteria. The twelve criteria above are derived from every clause of the Epic description, and each is traced to its source.

Three clarifying questions (Q-1 digital option, Q-2 failed-payment handling, Q-3 real-backend scope) are open. Each has a recorded working assumption, so none blocks this draft. Their answers may adjust BR-2, BR-6, BR-14, and the Dependencies section. No Definition of Done items are blocking for `alora.default.v1`.
