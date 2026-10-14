# Risk & Finance Data Spine — Benefit Case and Justification

**Linking Product → Model → Model Limitations → Risk Factors → Limits → Reserving Policy**

| | |
|---|---|
| **Sponsors** | CFO (Product Control / Valuation Control), CRO (Market Risk, Counterparty Credit Risk, Wholesale Credit Risk), Head of Model Risk Management |
| **Document type** | Benefit case / investment justification |
| **Status** | Draft for steering committee review |
| **Date** | October 2026 |

---

## 1. Executive Summary

Today each of our risk and finance functions keeps its own version of the same core facts: what a product is, which model prices and risks it, what that model's known weaknesses are, which risk factors it depends on, which limits apply, and what reserves or valuation adjustments are needed to cover what the model cannot capture. These facts live in separate spreadsheets, model inventory tools, booking-system static data, limit systems and policy documents. People reconcile them by hand, often only after something has gone wrong.

We propose a **Data Spine**: one governed reference layer, versioned over time, that links every trade to:

1. a **product taxonomy** node,
2. the **pricing and risk models** (and versions) used for it, across Front Office, Market Risk, CCR and Credit,
3. each model's **limitations and conditions of use**,
4. the **risk factors** the product is sensitive to, and how each one is sourced, proxied and modelled,
5. the **limits** and risk-appetite measures it counts against,
6. the **reserving and valuation-adjustment policies** (model reserves, AVAs, Day-1 P&L deferral, fair-value levelling) that cover those limitations.

The spine does not replace source systems. It is the **link table and lineage layer** that joins them. It lets every function answer one question the same way:

> *"For this trade, which model are we relying on, what do we know it gets wrong, and where is that weakness covered — by a reserve, a capital add-on, a limit, or a P&L explain line?"*

**Headline benefits** (Section 7 explains how each will be quantified):

- **P&L Explain (PLEX):** the unexplained P&L can be attributed to known model limitations and missing risk factors, instead of being written up by hand each day. It also gives direct support for passing the FRTB P&L Attribution Test (PLAT).
- **Risk factor mapping:** one mapping from product to risk factor to market-data time series, used by VaR/ES, sensitivities, stress testing, CCR exposure simulation and PLEX. This removes the most common source of RNIV and NMRF capital, and of backtesting exceptions.
- **Reserving:** model-limitation reserves and prudent-valuation AVAs become rule-driven and complete, with full lineage. We can show that every material limitation is either reserved, capitalised, limited or accepted.
- **Capital efficiency:** we keep or extend IMA/IMM eligibility, cut conservative add-ons that exist only because we cannot evidence coverage, and lower NMRF/RNIV charges where proxies can be justified.
- **Regulatory and audit posture:** we can evidence model use for SR 11-7 / PRA SS1/23, data lineage for BCBS 239, and coverage for prudent valuation (CRR Art. 105). This closes recurring findings.
- **Efficiency:** we remove repeated manual reconciliations across Product Control, Market Risk, CCR, Credit and MRM.

---

## 2. Problem Statement — Current State

### 2.1 Symptoms we see today

| # | Symptom | Who feels it | Consequence |
|---|---|---|---|
| 1 | The product taxonomy differs between booking systems, Product Control, Market Risk, CCR and Credit | All | Each function rebuilds the same mapping, and reports do not tie out |
| 2 | The model inventory records models, but not **which trades actually use them** | MRM, Audit | Model use cannot be shown; tiering is based on guesswork rather than actual exposure |
| 3 | Model limitations sit in validation reports (PDF/Word), not as data | MRM, Product Control, Market Risk | Limitations are not enforced when trades are booked, reserved or risk-managed |
| 4 | Model reserves are set in spreadsheets with no link back to the limitation they cover | Product Control, Valuation Control | Coverage gaps and double counting; audit challenge on completeness |
| 5 | The PLEX unexplained bucket is investigated by hand every day | Product Control, Market Risk | High FTE cost; slow root-cause analysis; recurring unexplained items |
| 6 | Risk-factor mapping is done separately in front-office risk, the VaR engine and the CCR simulation engine | Market Risk, CCR | Mismatched sensitivities cause PLAT failures, backtesting exceptions and RNIV build-up |
| 7 | CCR exposure models do not record which products are modelled with simplifications or fallbacks | CCR, Credit | PFE understated for path-dependent or exotic trades; limit breaches found late |
| 8 | Credit limits are set by product type, but the product-type definitions differ from Market Risk and Finance | Wholesale Credit | Limit utilisation is disputed; approval cycles take longer |
| 9 | New Product Approval (NPA) conditions are not tracked after approval | NPA, all control functions | Conditions such as "reserve until model upgrade" are forgotten |
| 10 | Regulatory requests ("show every trade priced on model X version Y") take weeks | Regulatory Affairs, MRM | Poor first impression with supervisors; findings stay open |

### 2.2 Root cause

All of these share one root cause: **there is no authoritative, machine-readable link between product, model, limitation, risk factor, limit and reserve.** Every function owns one or two of these links, and nobody owns the chain.

---

## 3. What the Data Spine Is

### 3.1 Core entities and relationships

```
                    ┌──────────────────────┐
                    │      TRADE / POSITION│  (from booking systems)
                    └─────────┬────────────┘
                              │ classified as
                    ┌─────────▼────────────┐
                    │   PRODUCT TAXONOMY   │  asset class → product family → product → payoff features
                    └─────────┬────────────┘
             ┌────────────────┼──────────────────────────┬─────────────────────┐
             │ priced/risked by│ sensitive to              │ subject to          │ approved under
   ┌─────────▼────────┐ ┌──────▼──────────┐   ┌──────────▼────────┐ ┌──────────▼────────┐
   │ MODEL (+version) │ │  RISK FACTORS   │   │      LIMITS       │ │ NPA / CONDITIONS  │
   │ FO pricing, VaR, │ │ type, tenor,    │   │ market, CCR, credit│ │ of approval       │
   │ PFE/EPE, CVA,    │ │ source series,  │   │ concentration,    │ └───────────────────┘
   │ PD/LGD/EAD       │ │ proxy, NMRF flag│   │ risk appetite     │
   └─────────┬────────┘ └──────┬──────────┘   └───────────────────┘
             │ has                │ feeds
   ┌─────────▼────────────┐ ┌─────▼───────────────────────┐
   │  MODEL LIMITATIONS / │ │ PLEX / VaR / ES / Stress /  │
   │  CONDITIONS OF USE   │ │ CCR simulation / CVA        │
   └─────────┬────────────┘ └─────────────────────────────┘
             │ mitigated by (one or more)
   ┌─────────▼───────────────────────────────────────────────────────────┐
   │ MITIGANTS: Model reserve │ Prudent valuation AVA │ RNIV / capital    │
   │ add-on │ Limit / restriction │ Day-1 P&L deferral │ Fair-value level │
   │ Overlay to PFE / ECL │ Formal risk acceptance                       │
   └─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Key design principles

1. **Link, don't copy.** The spine holds keys, relationships and governed attributes. Source systems keep their own data.
2. **Temporal versioning (bitemporal).** Every link has an effective date and a recorded date, so we can rebuild "what model and limitation applied to this trade on that date, as we knew it then". This is essential for PLEX history, backtesting and audit.
3. **Limitations are first-class data.** Each limitation has an ID, a description, a severity, the affected products, the affected risk factors, a trigger condition (for example "vol > x", "maturity > 30y", "correlation outside range") and **one or more mandatory mitigants**.
4. **Coverage rule.** Every material limitation must map to at least one mitigant. Any unmapped limitation is reported as an exception.
5. **Single risk-factor dictionary.** One canonical definition of each risk factor, mapped to FO risk, the VaR/ES engine, the CCR engine, the stress-testing engine and PLEX.
6. **Clear ownership.** Each entity has a named data owner (see Section 9).
7. **BCBS 239 aligned.** Accuracy, completeness, timeliness and adaptability are measured as data-quality KPIs.

### 3.3 Illustrative limitation record

| Field | Example |
|---|---|
| Limitation ID | LIM-IR-0142 |
| Model / version | IR Bermudan Swaption — 1-factor Hull-White v4.2 |
| Description | A single factor cannot capture de-correlation between swap rates; this understates the value of Bermudan switch options on long-dated, steep curves |
| Products affected | Bermudan swaptions; callable range accruals (IR) |
| Risk factors affected | IR forward-rate correlation; swaption vol surface (co-terminal vs. non-co-terminal) |
| Trigger | Final maturity > 20y **or** number of call dates > 20 |
| Severity | High (Tier 1 model) |
| Mitigants | (a) Model uncertainty reserve per policy VCP-07 §4; (b) Model-risk AVA per CRR Art. 105 / EBA RTS; (c) RNIV for correlation in IMA; (d) PLEX explain line "Model limitation — IR correlation" |
| Remediation | 2-factor LMM benchmark; target Q3 next year |
| Owner | Head of IR Quant / MRM validator |

---

## 4. How the Data Spine Helps Each Function

### 4.1 Finance — Product Control and P&L Explain (PLEX)

**Current pain:** The daily P&L explain, which breaks P&L into new trades, amendments, carry/theta, risk-based (Greeks × market moves), reserves movement and unexplained, relies on sensitivities and risk-factor moves that are mapped by hand. The unexplained residual is investigated trader by trader. Recurring causes, such as known model approximations, missing risk factors and proxy basis, are rediscovered day after day.

**With the spine:**

| Capability | How the spine enables it | Benefit |
|---|---|---|
| **Consistent risk-based explain** | Risk factors for each product come from the canonical dictionary, so the Greeks used in PLEX match the risk factors used by Market Risk | Fewer "explain breaks" caused by mapping differences |
| **Attribution of unexplained P&L to known limitations** | Each limitation lists the risk factors it misses. PLEX can carve out an explain line, e.g. "Unmodelled correlation — LIM-IR-0142" | Unexplained becomes explained-by-known-cause; residual investigation effort falls sharply |
| **Higher-order and cross-gamma terms only where needed** | The spine flags products with significant non-linearity or cross effects (e.g. quanto, correlation, barrier) | Explain precision is targeted; compute cost is controlled |
| **Reserve movement explain** | Reserves link to limitations and risk factors, so movements in model reserves and AVAs can be explained by market moves and position changes | Explaining reserve P&L takes much less effort; fewer month-end surprises |
| **New trade / Day-1 P&L** | Products flagged with Level 3 inputs (from the fair-value-level link) automatically trigger the Day-1 P&L deferral rule (IFRS 9 B5.1.2A / ASC 820) | Deferral is consistently and completely applied |
| **FRTB PLAT support** | Hypothetical P&L (HPL) and risk-theoretical P&L (RTPL) use the same risk-factor mapping, and differences can be traced to named limitations or NMRFs | Root-cause analysis of PLAT amber/red desks; evidence for remediation plans |
| **IPV and fair-value levelling** | Risk factors carry observability attributes; products inherit IFRS 13 / ASC 820 levels from their inputs | Levelling is rule-based and auditable; Level 3 disclosures are produced faster |

**Example:** A long-dated Bermudan swaption book shows −$1.2m unexplained after a curve steepening. Today the team spends days investigating. With the spine, the trade is linked to LIM-IR-0142 (1F HW de-correlation), PLEX produces a "model limitation — correlation" line of approximately −$1.0m, and the residual falls to −$0.2m. The model reserve is also checked against the realised limitation impact to confirm it is adequate.

### 4.2 Finance — Valuation Control and Reserving Policy

| Capability | How the spine enables it | Benefit |
|---|---|---|
| **Complete reserve coverage** | Coverage rule: each material limitation → mitigant. Any limitation without a mitigant is reported as an exception | Shows completeness to auditors; avoids under-reserving |
| **No double counting** | One limitation may be covered by a reserve **and** an AVA **and** RNIV. The spine records the intended overlap and prevents unintended overlap | Accurate fair value and capital |
| **Prudent Valuation (CRR Art. 105 / EBA RTS)** | Model-risk, unearned-credit-spread, concentration and close-out AVAs are mapped to the products, models and risk factors they cover | Faster, defensible AVA calculations; fewer findings in supervisory review |
| **Policy-to-calculation lineage** | Reserve policy clauses (e.g. VCP-07 §4) are linked to the limitations they implement and the calculations that apply them | Policy changes can be assessed for impact immediately |
| **Release triggers** | When a model upgrade fixes a limitation, the spine shows which reserves can be released and by how much | Reserves are released in a controlled, evidenced way |

### 4.3 Market Risk

| Capability | How the spine enables it | Benefit |
|---|---|---|
| **Risk factor mapping (single source)** | Product → risk factor → time series → proxy (if any) → modellability status, all in one place | Removes inconsistent mappings across VaR, ES, stress and PLEX |
| **NMRF management (FRTB)** | Each risk factor carries the result of the Risk Factor Eligibility Test (RFET), its proxy and the basis between proxy and actual | Targeted data sourcing to make risk factors modellable; lower SES capital |
| **RNIV (Risks Not In VaR) completeness** | Limitations that name a missing risk factor automatically become RNIV candidates | The RNIV inventory is complete and sized consistently; fewer regulatory challenges |
| **VaR backtesting** | Backtesting exceptions can be traced to the limitations and proxies involved | Faster, evidence-based explanations to supervisors; fewer avoidable exceptions and multiplier add-ons |
| **Stress-testing coverage** | Stress scenarios are defined on canonical risk factors, and the spine shows which products have no shock applied | Fewer gaps in stress coverage; a more credible ICAAP |
| **Limit framework** | Market-risk limits (sensitivity, VaR, stress, concentration) are attached to product and risk-factor nodes, and conditions of use are enforced as limits (e.g. "max notional on model X above 30y") | Model limitations become controlled exposure, not just a footnote |
| **Desk structure / IMA eligibility** | Desk → products → models → risk factors, with PLAT and backtesting status | Supports keeping or extending IMA approval desk by desk |

### 4.4 Counterparty Credit Risk (CCR)

| Capability | How the spine enables it | Benefit |
|---|---|---|
| **Exposure model coverage** | Each product is mapped to its PFE/EPE simulation model, and to whether it is fully simulated, approximated (e.g. proxied by a vanilla trade) or uses an add-on fallback | Exposures understated by crude product proxies are made visible |
| **IMM vs. SA-CCR eligibility** | Products not approved for IMM (CRE53) are flagged to fall back to SA-CCR (CRE52), with full lineage | Correct regulatory EAD; better IMM scope management |
| **Consistent risk factors between Market Risk and CCR** | CCR simulation uses the same canonical risk factor dictionary, with documented differences (e.g. calibration under the real-world vs. risk-neutral measure) | Fewer exposure-vs-MTM reconciliation breaks; CCR backtesting is easier to explain |
| **Wrong-way risk** | Products where a counterparty-related risk factor (e.g. own-sector equity, sovereign FX) drives the exposure are flagged automatically | Specific WWR is identified rather than left to manual review |
| **CVA (SA-CVA / BA-CVA)** | CVA sensitivities are mapped to canonical risk factors; products and models eligible for SA-CVA are tracked | CVA capital is optimised and hedge recognition is supported |
| **Netting and collateral** | Links between trade, netting set, CSA and margin model let limitations (e.g. "MPoR assumption not valid for illiquid collateral") feed PFE overlays | More accurate collateralised exposure |
| **PFE limits and overlays** | Model limitations in exposure models trigger PFE overlays or conservative limit usage | Reduces late discovery of limit breaches |

### 4.5 Wholesale Credit Risk

| Capability | How the spine enables it | Benefit |
|---|---|---|
| **Harmonised product types for credit limits** | Credit limit product types use the same taxonomy nodes as Market Risk, CCR and Finance | Fewer utilisation disputes; faster credit approvals |
| **Right exposure measure per product** | The spine records whether a product counts against limits on notional, MTM + add-on, PFE, or loan-equivalent, and which model provides the number | Utilisation is consistent across loans, derivatives and securities financing |
| **Credit models (PD / LGD / EAD / CCF)** | Facility and product types are linked to the rating, LGD and CCF models used, with their limitations (e.g. "LGD model not calibrated for structured repo") | Product-level visibility of model risk in RWA and IFRS 9 / CECL ECL |
| **ECL overlays (IFRS 9 / CECL)** | Known model limitations link to management overlays, just as Finance reserves link to pricing-model limitations | Overlays are transparent and auditable; overlays are released when models are fixed |
| **Concentration and risk appetite** | Product and risk-factor links support concentration views (e.g. single-name exposure across loans, CDS, bonds and derivative PFE) | A total exposure view of each obligor |
| **Credit approval** | Credit papers can pull a product's model limitations and existing mitigants automatically | Better-informed decisions; less manual research |

### 4.6 Model Risk Management (MRM)

| Capability | How the spine enables it | Benefit |
|---|---|---|
| **Model use evidence** | Trades link to models and versions, so actual use is measurable (SR 11-7; PRA SS1/23 Principle 1 on model identification and use) | Inventory completeness can be proven; unauthorised model use is detected |
| **Exposure-based tiering** | Model materiality is calculated from linked notional, MTM, risk and P&L | Validation resources go where the risk is |
| **Enforcement of conditions of use** | Limitation triggers (e.g. maturity, vol, moneyness) are checked daily against trades | Breaches of conditions of use are found automatically, not in annual review |
| **Limitation lifecycle** | Each limitation is tracked from discovery to mitigation to remediation to closure | A management view of model risk; a clear remediation backlog |
| **Aggregate model risk** | Reserves, AVAs, RNIV and overlays tied to limitations add up to a quantified model risk figure | Supports model risk appetite statements and Pillar 2 assessment |

### 4.7 Other beneficiaries

- **New Product Approval:** NPA conditions become linked data. Post-approval conditions, such as a temporary reserve or a notional cap, are tracked and enforced automatically.
- **Regulatory Reporting & Capital:** one lineage from trade to model to risk factor to capital calculation (FRTB IMA/SA, SA-CCR/IMM, CVA, credit RWA).
- **Internal / External Audit:** a single place to test completeness and accuracy of reserves, model use and risk coverage.
- **Front Office / Quants:** a clear view of which limitations limit business (reserves, capital, limits), which helps decide which model upgrades to prioritise.
- **Technology:** fewer point-to-point mappings; one reference service replaces several spreadsheets and copies of static data.

---

## 5. End-to-End Use Cases

### Use case A — Daily: from limitation trigger to P&L, risk and capital

1. A new 30y Bermudan swaption is booked and classified as product IR.SWPN.BERM.
2. The spine resolves its pricing model (1F HW v4.2), risk factors (IR curve, swaption vol cube, **correlation — not captured**) and limitation LIM-IR-0142, which is **triggered** because maturity is above 20y.
3. Automatic actions:
   - **Product Control:** the model uncertainty reserve is calculated under VCP-07; Day-1 P&L deferral is assessed because the Level 3 input flag is set.
   - **Valuation Control:** the model-risk AVA is included.
   - **Market Risk:** the position is added to the correlation RNIV; the sensitivity limit for this model above 20y is updated.
   - **CCR:** PFE uses the approved simulation model; if the exposure model has its own limitation, a PFE overlay is applied.
   - **Credit:** counterparty limit utilisation is updated with consistent product type and exposure measure.
   - **PLEX:** the explain line "Model limitation — IR correlation" is activated for this book.
   - **MRM:** model usage is updated and counts toward model materiality.

### Use case B — Model upgrade

The new 2-factor model is approved. The spine identifies every affected trade, the limitation that has been remediated, and the reserves, AVAs and RNIV that can be released. It shows the expected P&L and capital impact before go-live, and updates PLEX explain lines from the effective date.

### Use case C — Regulatory request

The supervisor asks: *"List all positions valued with models that have open high-severity limitations, with the related reserves and capital add-ons."* Today this takes weeks. With the spine it is a single query, with lineage evidence attached.

### Use case D — FRTB PLAT failure root cause

A desk turns amber on PLAT. The spine breaks HPL − RTPL down by risk factor and shows that most of the gap comes from (i) a proxied NMRF and (ii) a limitation in the risk engine's pricing. Remediation is targeted, either by sourcing data for the risk factor or by aligning the pricer, instead of a broad investigation.

---

## 6. Strategic and Regulatory Drivers

| Driver | Relevance |
|---|---|
| **SR 11-7 / OCC 2011-12; PRA SS1/23** | Model inventory, use, limitations and conditions of use must be known and controlled; SS1/23 expects model risk to be identified and managed across the enterprise |
| **BCBS 239** | Risk data aggregation: accuracy, completeness, timeliness and lineage |
| **FRTB (Basel MAR 31–33)** | PLAT, backtesting, RFET/NMRF and desk-level IMA eligibility all depend on consistent risk-factor mapping |
| **SA-CCR / IMM (CRE52 / CRE53), CVA (MAR50)** | Product-to-exposure-model eligibility, consistent risk factors, WWR identification |
| **Prudent Valuation (CRR Art. 105, EBA RTS) and the US equivalent valuation-control expectations** | Model-risk and other AVAs must be complete and evidenced |
| **IFRS 13 / ASC 820; IFRS 9 / CECL** | Fair-value hierarchy, Day-1 P&L, ECL model overlays |
| **Supervisory findings (internal)** | *[Insert open MRAs / findings that this programme closes]* |

---

## 7. Benefit Quantification Framework

> **Note:** The figures below are **illustrative placeholders**. They show the method and must be calibrated with each function's baseline data during Phase 0. Do not quote them externally.

### 7.1 Benefit categories

| Category | Driver | How to measure | Illustrative range* |
|---|---|---|---|
| **Capital — Market Risk** | Lower NMRF/SES charge through better data and proxies; lower RNIV through precise sizing; avoid PLAT failure (fallback to SA) on key desks; fewer backtesting exceptions / lower multiplier | RWA delta × cost of capital | 2–5% of market risk RWA on affected desks |
| **Capital — CCR / CVA** | Keep or extend IMM scope; SA-CVA eligibility; precise overlays replace blanket add-ons | EAD / CVA RWA delta × cost of capital | 1–3% of CCR RWA |
| **Reserves / P&L accuracy** | Remove double-counted reserves; controlled release after model upgrades; avoid late reserve surprises | Reserve releases and avoided adjustments | Calibrate against last 3 years of reserve true-ups |
| **Operational efficiency** | Less manual PLEX investigation, mapping reconciliation, reserve spreadsheets, regulatory request work and audit sampling | FTE hours × loaded cost | 15–30% of effort spent on these activities in PC, MR, CCR, Credit and MRM |
| **Regulatory / control** | Close MRAs; avoid capital add-ons (Pillar 2A / scalars) linked to model risk or data weaknesses | Avoided add-on × cost of capital; findings closed | Case by case |
| **Risk avoidance** | Earlier detection of breaches of conditions of use, understated PFE and unreserved limitations | Expected loss avoided (frequency × severity from loss data and scenarios) | Scenario-based |
| **Speed** | Faster NPA, model change impact analysis and credit approvals | Cycle-time reduction | 30–50% for tasks driven by lineage queries |

*Ranges are hypotheses to be tested, not commitments.

### 7.2 Efficiency baseline template (to complete in Phase 0)

| Function | Activity | Current FTE | Expected reduction | Saved FTE |
|---|---|---|---|---|
| Product Control | Daily PLEX unexplained investigation | | | |
| Product Control / VC | Model reserve and AVA calculation and evidence | | | |
| Market Risk | Risk-factor mapping maintenance, RNIV inventory, backtesting explains | | | |
| CCR | Product-to-exposure-model mapping, overlay sizing, MTM reconciliation | | | |
| Wholesale Credit | Product-type reconciliation for limits; overlay governance | | | |
| MRM | Inventory attestation, model-use evidence, limitation tracking | | | |
| Reg Reporting / Audit support | Ad hoc lineage requests | | | |
| **Total** | | | | |

### 7.3 Financial summary template

| | Year 0 | Year 1 | Year 2 | Year 3 |
|---|---|---|---|---|
| Build cost (people, tech) | | | | |
| Run cost | | | | |
| Efficiency savings | | | | |
| Capital benefit (RWA × CoC) | | | | |
| Reserve / P&L benefit | | | | |
| Risk avoidance (expected) | | | | |
| **Net benefit** | | | | |
| **Cumulative NPV / payback** | | | | |

---

## 8. Delivery Approach — Phased Roadmap

| Phase | Scope | Key deliverables | Exit criteria |
|---|---|---|---|
| **0. Mobilise & baseline (≈ 2–3 months)** | Governance, data owners, baseline metrics | Target data model; baseline FTE / capital / reserve data; pilot selection | Steering committee approves benefit baseline |
| **1. Foundation + pilot (≈ 4–6 months)** | One asset class (e.g. Rates, which has the most exotic-model limitations) | Product taxonomy; model and version links; limitation register as data; canonical risk-factor dictionary; reserve-to-limitation links | Pilot desk: limitation coverage at 100%; PLEX limitation lines live |
| **2. Risk integration (≈ 6 months)** | VaR/ES, FRTB RFET/PLAT, CCR exposure models, CVA | Shared risk-factor mapping in MR and CCR engines; RNIV and NMRF auto-population; PFE overlays linked to limitations | Measured reduction in mapping breaks; PLAT root-cause tool live |
| **3. Credit & enterprise roll-out (≈ 6–9 months)** | Remaining asset classes; Wholesale Credit limits and ECL models; NPA integration | Harmonised credit product types; ECL overlay links; NPA conditions as data | All asset classes onboarded; NPA conditions tracked |
| **4. Optimise (ongoing)** | Automation and analytics | Daily checks on conditions of use; model risk dashboard; scenario impact tools | KPIs in Section 9.2 met |

**Build principles:** start with the highest-pain asset class; deliver usable outputs every quarter; reuse existing reference-data and inventory platforms where possible; expose the spine through APIs and a query layer, not new manual uploads.

---

## 9. Governance, Ownership and KPIs

### 9.1 Data ownership (RACI summary)

| Entity | Owner (Accountable) | Key contributors |
|---|---|---|
| Product taxonomy | Product Control / Finance Data Office | Front Office COO, Market Risk, CCR, Credit |
| Model inventory & versions | MRM | Quant teams, model owners |
| Model limitations & conditions of use | MRM (validator) | Model owners, Product Control, Market Risk |
| Risk-factor dictionary | Market Risk Methodology | CCR, Product Control, Market Data |
| Limits | Market Risk / CCR / Wholesale Credit (by type) | Risk Appetite owner |
| Reserving & AVA policy links | Valuation Control | Product Control, Accounting Policy |
| NPA conditions | NPA Office | All control functions |
| Platform & lineage | Risk & Finance Technology / CDO | — |

A **Data Spine Council** (monthly) with Finance, MR, CCR, Credit, MRM and Technology approves taxonomy changes, resolves conflicts and reviews coverage exceptions.

### 9.2 Success KPIs

| KPI | Target |
|---|---|
| % of trades (by MTM and by count) linked to product + model version | > 99% |
| % of material model limitations with at least one mitigant | 100% |
| % of reserves / AVAs linked to a limitation or policy clause | 100% |
| Daily PLEX unexplained (abs.) as % of total P&L, for pilot desks | Reduce by ≥ 50% from baseline |
| Risk-factor mapping breaks between FO, MR and CCR | Reduce by ≥ 70% |
| Time to answer regulatory lineage requests | From weeks to < 2 days |
| Breaches of conditions of use detected automatically vs. in periodic review | > 90% automated |
| Open supervisory / audit findings closed by the programme | *[list]* |

---

## 10. Risks and Mitigants

| Risk | Mitigant |
|---|---|
| Taxonomy disputes across functions delay delivery | Council with decision rights; start from an existing taxonomy; allow mapped aliases |
| Limitations are hard to express as machine-readable triggers | Start with structured fields and free text; add triggers for high-severity limitations first |
| Scope creep into a full data warehouse | "Link, don't copy" principle; a clear non-goals list |
| Source-system data quality | BCBS 239 DQ checks at ingestion; exceptions are owned by the data owner |
| Benefits not realised or not measured | Baseline in Phase 0; benefits tracked by Finance; quarterly benefit reviews |
| Change fatigue in control functions | Deliver early wins (PLEX limitation lines, regulatory query tool) in the pilot |

---

## 11. Alternatives Considered

| Option | Assessment |
|---|---|
| **Do nothing** | Costs and findings keep growing; FRTB / IMA eligibility risk remains; not recommended |
| **Fix each function separately** (e.g. a Market Risk mapping project, a Product Control reserve tool) | Lower upfront cost, but creates new silos; does not solve the cross-functional lineage problem |
| **Buy an off-the-shelf model inventory with use-tracking only** | Solves part of MRM's need; does not link risk factors, limits or reserves |
| **Data Spine (recommended)** | Fixes the root cause; one investment benefits five functions; reuses existing platforms |

---

## 12. Decision Requested

1. **Approve Phase 0** (mobilise and baseline) with named data owners from each function.
2. **Endorse Rates as the pilot asset class** (or an alternative chosen by the steering committee).
3. **Agree governance:** set up the Data Spine Council and confirm the data-ownership RACI in Section 9.1.
4. **Commit to a benefits review** at the end of Phase 0, with calibrated figures replacing the illustrative ranges in Section 7.

---

### Appendix A — Glossary

| Term | Meaning |
|---|---|
| **PLEX** | P&L Explain: breaks daily P&L down into its drivers (new trades, carry, risk-based, reserves, unexplained) |
| **HPL / RTPL / PLAT** | FRTB hypothetical P&L / risk-theoretical P&L / P&L attribution test |
| **RFET / NMRF / SES** | FRTB risk factor eligibility test / non-modellable risk factor / stressed expected shortfall capital for NMRFs |
| **RNIV** | Risks Not In VaR: risks not captured in the VaR/ES model, capitalised separately |
| **AVA** | Additional Valuation Adjustment under prudent valuation (CRR Art. 105) |
| **PFE / EPE / EAD** | Potential future exposure / expected positive exposure / exposure at default |
| **IMM / SA-CCR** | Internal model method / standardised approach for counterparty credit risk |
| **SA-CVA / BA-CVA** | Standardised / basic approaches for CVA capital |
| **WWR** | Wrong-way risk |
| **ECL** | Expected credit loss (IFRS 9 / CECL) |
| **NPA** | New Product Approval |
| **Condition of use** | A restriction set at model approval (e.g. product scope, parameter range) that must hold for the model to be used |

### Appendix B — Minimum data attributes (Phase 1)

- **Product:** product ID, taxonomy path, payoff features, asset class, FV level default, NPA ID
- **Model:** model ID, version, purpose (FO pricing / VaR / PFE / CVA / PD / LGD / EAD), tier, approval status, validation date
- **Limitation:** ID, model ID/version, description, severity, products affected, risk factors affected, trigger logic, mitigant IDs, remediation plan, owner, status
- **Risk factor:** ID, type, curve/surface/tenor, source series, proxy ID, RFET status, observability (FV level), used-by engines
- **Mitigant:** ID, type (reserve / AVA / RNIV / limit / overlay / acceptance), policy reference, calculation ID, amount (link to source)
- **Limit:** ID, type, measure, product and risk-factor scope, owner
- **Time:** effective-from/to and recorded-from/to on every link
