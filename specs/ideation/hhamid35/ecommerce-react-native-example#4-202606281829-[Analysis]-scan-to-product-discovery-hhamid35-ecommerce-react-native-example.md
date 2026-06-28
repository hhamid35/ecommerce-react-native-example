# Ideation Analysis: Scan-to-Product Discovery (hhamid35/ecommerce-react-native-example#4)

> Jira Epic: [hhamid35/ecommerce-react-native-example#4](https://github.com/hhamid35/ecommerce-react-native-example/issues/4)
> Reporter: hhamid35 · Story points: Not estimated
> Labels: epic

## Original Business Requirement

_Verbatim from the linked Epic `hhamid35/ecommerce-react-native-example#4` (reporter: hhamid35; labels: epic). No acceptance criteria were supplied on the Epic._

> Let shoppers identify a product by scanning a barcode or QR code from the home screen (the app already hints at this with a “Scan” affordance). The flow opens the device camera, reads a code, resolves it against catalog (SKU or external ID), and lands the user on the matching product detail or a clear “not found” state with suggested next steps.

**Acceptance Criteria (verbatim):**

1. _None supplied on the Epic._ No formal acceptance criteria were attached to this requirement. The implicit acceptance expectations embedded in the description are derived and assessed in the **Acceptance Criteria Coverage** table below, and formalizing them is raised as a clarifying question (see Q-3).

## Domain Concept Identification

### Existing Capabilities

- **Scan entry point on the home screen**: shoppers already see and can tap a “Scan” affordance next to the search box on the home screen — the hint named in the requirement is already a live, tappable control today.
- **Camera-based code reading**: the app already opens the device camera, asks for camera permission, and reads both barcodes and QR codes within a framed viewfinder. It already handles the case where a shopper declines camera access by explaining why access is needed and offering a route into device settings or back to manual search.
- **Resolving a scanned code to a product**: the app already takes a scanned code, cleans it up, and looks it up against the catalog, then lands the shopper on the matching product’s detail page on success.
- **“Not found” experience with next steps**: when a code matches nothing in the catalog, shoppers already see a clear “product not found” screen that shows the code they scanned and offers concrete next steps — scan again, search manually, or browse categories.
- **Connection-failure handling**: if the store can’t be reached during a lookup, the app already shows a non-blocking message and a retry option rather than failing silently.
- **Catalog with a product code**: every product in the catalog already carries an internal product code (a SKU) that the lookup matches against.

_In short: a substantial scan-to-product flow already exists end-to-end in the product today. This materially changes the scope of this Epic from “build the feature” to “close specific gaps and confirm the experience meets expectations.”_

### New Capabilities Needed

- **Resolve by an external identifier, not just the internal SKU**: the requirement asks to resolve a scanned code against the catalog by “SKU **or** external ID.” Today only the internal product code (SKU) is matched; there is no notion of an external/manufacturer identifier (such as the EAN/UPC barcode physically printed on retail goods) tied to products. This is the principal capability gap — a shopper scanning a real product’s printed barcode would not be recognized unless that value happens to equal the internal SKU.
- **Confirmed handling when one code matches more than one product**: the catalog does not currently guarantee that a code maps to exactly one product. A decision and a defined shopper experience for the “multiple matches” case is net-new.
- **Formalized acceptance criteria & analytics expectations**: there is no agreed, written definition of “done” for this flow (success, not-found, error, permission-denied), nor an agreed view of which scan outcomes the business wants to measure.

### Key Business Rules

- _A scanned code must land the shopper on exactly one outcome_ — the matching product, a clear “not found,” or a recoverable error (**explicit** in the requirement).
- _“Not found” must always offer a way forward_ (manual search / browse), never a dead end (**explicit**).
- _Codes should be matched consistently regardless of casing or surrounding whitespace_ — a code is treated the same however the camera reads it (**implicit**; already reflected in how codes are cleaned up today).
- _A code should resolve to a single product_ — the business intent is one-scan-one-product; what happens if two products share a code needs a PO decision (**implicit**; see Q-2).
- _Camera access is required to scan, and declining it must not trap the shopper_ — they must still be able to search manually (**implicit**; already honored today).

## Strategic Approach

### Recommended Direction

- **Reuse and complete what already exists rather than rebuild.** The camera flow, code cleanup, success path, not-found experience, and connection-error handling are already in place and working against the live home-screen affordance. The Epic’s remaining value is concentrated in **one capability gap and a few confirmations**, not in net-new construction.
- **Close the external-ID gap as the core deliverable.** Decide what “external ID” means for this business (most commonly the manufacturer barcode printed on goods), associate those identifiers with catalog products, and allow a scan to resolve by either the internal SKU or that external identifier. This is what turns “scan our own SKU labels” into “scan the barcode on the actual product,” which is the shopper behavior the Epic implies.
- **Lock the experience with agreed acceptance criteria.** Because the flow already exists, the fastest path to “done” is to write down the expected behavior for each outcome and verify the existing experience against it, rather than starting from a blank slate.

### Key Decisions & Trade-offs

- **What counts as an “external ID”**: treat it as the standard retail barcode (EAN/UPC) printed on products _vs._ a partner/marketplace catalog ID _vs._ both. → _Recommendation_: prioritize the printed retail barcode, since that is what a shopper physically scans; treat partner IDs as a later extension. This keeps scope tight and matches real shopper behavior. (See Q-1.)
- **Who can use scan lookup**: allow any shopper (including not-signed-in) to scan and view a product _vs._ require sign-in. → _Recommendation_: keep scan-to-view open to all shoppers, consistent with how product browsing already works, so the feature stays frictionless. Confirm with the PO given that the lookup is reachable without sign-in today. (See Q-2 context.)
- **Behavior when a code matches more than one product**: show the first match _vs._ present a short chooser _vs._ treat as not-found. → _Recommendation_: present a short “did you mean” chooser when more than one product shares a code, so the shopper is never silently sent to the wrong item. (See Q-2.)
- **How strictly to define “done” now**: ship against the existing behavior _vs._ formalize criteria first. → _Recommendation_: formalize lightweight acceptance criteria first (low cost, high clarity) because the build is largely complete and the risk is mismatched expectations, not engineering effort.

### Alternatives Considered

- **Build the scan flow from scratch**: rejected — a working flow already exists; rebuilding would waste effort and risk regressing handled cases (permissions, not-found, connection errors).
- **Match only on the internal SKU and consider the Epic done**: rejected — this ignores the explicit “or external ID” requirement and would fail shoppers scanning real printed barcodes, which is the likely real-world use.
- **Require sign-in before scanning**: rejected as the default — it adds friction to a discovery feature meant to speed shoppers to a product; revisit only if there is a business reason to gate it.

## Risk & Gap Analysis

### Open Questions & Ambiguities

- _Definition of “external ID”_: the requirement pairs “SKU or external ID” but the catalog only holds an internal SKU today. The meaning of “external ID” directly determines scope and shopper value. → escalated as **Q-1**.
- _Duplicate / ambiguous matches_: the catalog does not guarantee a code maps to a single product, and the desired behavior on collisions is unstated. → escalated as **Q-2**.
- _Acceptance criteria absent_: no formal “done” definition exists for any outcome (success, not-found, error, permission-denied). → escalated as **Q-3**.
- _Manual entry fallback_: it is unclear whether shoppers should be able to type a code when the camera can’t read a damaged or missing label — not addressed in the requirement.

### Edge Cases & Scenarios

- **Real printed barcode that isn’t the SKU**: a shopper scans the manufacturer barcode on a physical product; today this would land on “not found” even though we sell the item — the central gap.
- **QR code containing a link rather than a code**: a scanned QR may carry a URL instead of a product code; the expected behavior (resolve, ignore, or treat as not-found) is undefined.
- **The same code on two products**: which product the shopper sees, or whether they choose, is unresolved (see Q-2).
- **Camera permission declined or later revoked**: handled today (explained, with a path to settings and manual search) — should be confirmed as acceptable.
- **Store unreachable mid-scan**: handled today with a retry message — should be confirmed as the desired behavior.
- **Discontinued or out-of-stock product scanned**: the requirement doesn’t say whether such products should resolve to their detail page or be treated as not-found.

### Delivery Risks & Dependencies

- **Source of external identifiers (data dependency)**: closing the core gap depends on obtaining and maintaining external/barcode identifiers for catalog products. If that data isn’t available or kept current, the feature’s value is limited regardless of the app work — a cost/time and data-ownership dependency that should be confirmed early.
- **Mismatched expectations (trust risk)**: because the flow already appears finished, there is a real risk of declaring it “done” while the explicit “external ID” intent is unmet — shoppers would experience frequent “not found” on legitimate products, eroding trust in the feature.
- **Open (unauthenticated) lookup**: scan lookup is reachable without sign-in today. This is reasonable for product discovery but should be a deliberate, confirmed choice, and lookups should be protected against abuse (e.g., excessive automated requests) so the catalog service stays healthy.
- **Sending the wrong shopper to the wrong product (trust risk)**: without a defined collision rule, an ambiguous code could quietly route a shopper to an incorrect item.
- **Cross-device/camera variability**: code reading quality varies by device and lighting; acceptance testing should cover a representative range so the feature feels reliable in stores.

### Acceptance Criteria Coverage

_No acceptance criteria were supplied on the Epic. The rows below are the implicit acceptance expectations derived from the requirement description, each assessed against the current product state. Formalizing these is raised as Q-3._

| AC# | Description | Addressable? | Gaps / Notes |
| --- | --- | --- | --- |
| 1 (implicit) | Shopper can launch scanning from the home-screen “Scan” affordance | Yes | Affordance and entry into the camera flow already exist. |
| 2 (implicit) | App opens the camera and reads a barcode or QR code | Yes | Camera + barcode/QR reading and permission handling already exist. |
| 3 (implicit) | A scanned code resolves against the catalog by SKU | Yes | Internal product-code (SKU) matching already works. |
| 4 (implicit) | A scanned code resolves against the catalog by external ID | No | No external/barcode identifier exists on products today — the core gap (see Q-1). |
| 5 (implicit) | A matched scan lands the shopper on the correct product detail | Partial | Works for single SKU matches; behavior on multiple matches is undefined (see Q-2). |
| 6 (implicit) | An unmatched scan shows a clear “not found” state with suggested next steps | Yes | Not-found screen with scan-again / search / browse already exists. |
| 7 (implicit) | Connection or read failures are handled gracefully (recoverable) | Yes | Retry-on-error and permission-declined handling already exist; confirm these meet expectations. |

## Notes for the Product Owner

The most important takeaway: **most of this feature already exists and works**. The decision in front of you is not “build scan,” but “define what ‘external ID’ means, source that data, decide the multi-match behavior, and agree on what ‘done’ looks like.” Answering Q-1–Q-3 will let Design proceed with a tightly scoped, low-risk plan.