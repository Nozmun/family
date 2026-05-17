#!/usr/bin/env python3
"""Mortgage Brother — UK Whole-of-Market Mortgage Advisor AI Agent."""

import json
import math
import sys
import anthropic

client = anthropic.Anthropic()
MODEL = "claude-sonnet-4-6"

# ── Calculation helpers ────────────────────────────────────────────────────────

def _monthly_payment(principal: float, annual_rate: float, term_months: int) -> float:
    """Standard repayment (P&I) monthly instalment."""
    if annual_rate == 0:
        return principal / term_months
    r = annual_rate / 100 / 12
    return principal * r * (1 + r) ** term_months / ((1 + r) ** term_months - 1)


def _interest_only_monthly(principal: float, annual_rate: float) -> float:
    return principal * annual_rate / 100 / 12


# ── Tool implementations ───────────────────────────────────────────────────────

def calculate_mortgage(
    property_value: float,
    loan_amount: float,
    annual_rate_percent: float,
    term_years: int,
    repayment_type: str = "repayment",
    arrangement_fee: float = 0,
    add_fee_to_loan: bool = False,
    cashback: float = 0,
    initial_period_years: int = 0,
    reversion_rate_percent: float = 0,
) -> dict:
    """
    Full cost analysis for a single mortgage product.
    Handles repayment/interest-only, fee capitalisation, and SVR reversion.
    """
    effective_loan = loan_amount + (arrangement_fee if add_fee_to_loan else 0)
    ltv = loan_amount / property_value * 100

    term_months = term_years * 12
    initial_months = initial_period_years * 12
    reversion_months = term_months - initial_months

    if repayment_type == "interest_only":
        initial_monthly = _interest_only_monthly(effective_loan, annual_rate_percent)
    else:
        initial_monthly = _monthly_payment(effective_loan, annual_rate_percent, term_months)

    initial_cost = initial_monthly * initial_months if initial_months else initial_monthly * term_months

    # Balance remaining after initial period (repayment only)
    reversion_cost = 0
    reversion_monthly = None
    balance_at_reversion = effective_loan
    if initial_months and reversion_months and repayment_type == "repayment":
        r = annual_rate_percent / 100 / 12
        if r > 0:
            balance_at_reversion = effective_loan * (1 + r) ** initial_months - initial_monthly * ((1 + r) ** initial_months - 1) / r
        else:
            balance_at_reversion = effective_loan - initial_monthly * initial_months
        reversion_monthly = _monthly_payment(balance_at_reversion, reversion_rate_percent, reversion_months) if reversion_rate_percent else None
        reversion_cost = (reversion_monthly or 0) * reversion_months

    total_repaid = initial_cost + reversion_cost
    upfront_fees = arrangement_fee if not add_fee_to_loan else 0
    total_cost = total_repaid + upfront_fees - cashback

    return {
        "ltv_percent": round(ltv, 2),
        "effective_loan": round(effective_loan, 2),
        "initial_monthly_payment": round(initial_monthly, 2),
        "reversion_monthly_payment": round(reversion_monthly, 2) if reversion_monthly else None,
        "total_repaid": round(total_repaid, 2),
        "total_interest": round(total_repaid - effective_loan, 2),
        "arrangement_fee": arrangement_fee,
        "cashback": cashback,
        "total_true_cost": round(total_cost, 2),
        "balance_at_reversion": round(balance_at_reversion, 2) if initial_months else None,
    }


def compare_products(products: list) -> dict:
    """
    Compare multiple mortgage products side by side.
    Each product is a dict matching calculate_mortgage parameters plus a 'label'.
    Returns ranked results by lowest_monthly, lowest_total_cost, highest_flexibility score.
    """
    results = []
    for p in products:
        label = p.pop("label", "Unnamed")
        flexibility_score = p.pop("flexibility_score", 5)
        erc_notes = p.pop("erc_notes", "")
        result = calculate_mortgage(**p)
        result["label"] = label
        result["flexibility_score"] = flexibility_score
        result["erc_notes"] = erc_notes
        results.append(result)

    by_monthly = sorted(results, key=lambda x: x["initial_monthly_payment"])
    by_cost = sorted(results, key=lambda x: x["total_true_cost"])
    by_flex = sorted(results, key=lambda x: x["flexibility_score"], reverse=True)

    return {
        "products": results,
        "ranked_by_lowest_monthly": [r["label"] for r in by_monthly],
        "ranked_by_lowest_total_cost": [r["label"] for r in by_cost],
        "ranked_by_highest_flexibility": [r["label"] for r in by_flex],
    }


def stress_test_affordability(
    loan_amount: float,
    term_years: int,
    base_rate_percent: float,
    stress_rates_percent: list,
    gross_annual_income: float,
    monthly_committed_outgoings: float = 0,
) -> dict:
    """
    Test repayment affordability across multiple rate scenarios.
    Flags where payment exceeds 35% or 40% of gross monthly income.
    """
    gross_monthly = gross_annual_income / 12
    results = []
    for rate in stress_rates_percent:
        monthly = _monthly_payment(loan_amount, rate, term_years * 12)
        disposable = gross_monthly - monthly - monthly_committed_outgoings
        pct_income = monthly / gross_monthly * 100
        results.append({
            "rate_percent": rate,
            "monthly_payment": round(monthly, 2),
            "pct_gross_income": round(pct_income, 1),
            "monthly_disposable_after_mortgage": round(disposable, 2),
            "affordable_35pct_rule": pct_income <= 35,
            "affordable_40pct_rule": pct_income <= 40,
        })
    base_payment = _monthly_payment(loan_amount, base_rate_percent, term_years * 12)
    return {
        "base_rate_percent": base_rate_percent,
        "base_monthly_payment": round(base_payment, 2),
        "gross_monthly_income": round(gross_monthly, 2),
        "stress_scenarios": results,
    }


def remortgage_analysis(
    current_balance: float,
    current_rate_percent: float,
    months_remaining: int,
    erc_amount: float,
    new_rate_percent: float,
    new_term_years: int,
    arrangement_fee: float = 0,
    valuation_legal_fees: float = 0,
) -> dict:
    """
    Full remortgage cost-benefit analysis including ERCs and all fees.
    Returns breakeven, monthly savings, and lifetime savings.
    """
    cur_monthly = _monthly_payment(current_balance, current_rate_percent, months_remaining)
    new_monthly = _monthly_payment(current_balance, new_rate_percent, new_term_years * 12)

    monthly_savings = cur_monthly - new_monthly
    total_switching_costs = erc_amount + arrangement_fee + valuation_legal_fees

    if monthly_savings <= 0:
        return {
            "recommendation": "Do not remortgage now",
            "reason": "New monthly payment is not lower than current — switching costs cannot be recovered.",
            "current_monthly": round(cur_monthly, 2),
            "new_monthly": round(new_monthly, 2),
            "monthly_difference": round(monthly_savings, 2),
            "total_switching_costs": round(total_switching_costs, 2),
        }

    breakeven_months = total_switching_costs / monthly_savings
    current_remaining_cost = cur_monthly * months_remaining
    new_total_cost = new_monthly * new_term_years * 12 + total_switching_costs
    lifetime_savings = current_remaining_cost - new_total_cost

    return {
        "recommendation": "Remortgage" if breakeven_months < months_remaining * 0.8 else "Borderline — consider timing",
        "current_monthly": round(cur_monthly, 2),
        "new_monthly": round(new_monthly, 2),
        "monthly_savings": round(monthly_savings, 2),
        "total_switching_costs": round(total_switching_costs, 2),
        "breakeven_months": round(breakeven_months, 1),
        "breakeven_years": round(breakeven_months / 12, 1),
        "lifetime_savings_estimate": round(lifetime_savings, 2),
        "erc_amount": erc_amount,
    }


def overpayment_analysis(
    current_balance: float,
    annual_rate_percent: float,
    months_remaining: int,
    monthly_overpayment: float,
    max_annual_overpayment_pct: float = 10.0,
) -> dict:
    """
    Calculate interest saved and term reduction from regular monthly overpayments.
    Respects common 10% ERC-free overpayment cap.
    """
    standard_monthly = _monthly_payment(current_balance, annual_rate_percent, months_remaining)
    annual_overpayment_limit = current_balance * max_annual_overpayment_pct / 100
    monthly_limit = annual_overpayment_limit / 12
    effective_overpayment = min(monthly_overpayment, monthly_limit)

    r = annual_rate_percent / 100 / 12
    balance = current_balance
    months_with_overpayment = 0
    interest_with_op = 0.0
    while balance > 0:
        interest = balance * r
        interest_with_op += interest
        principal_paid = standard_monthly + effective_overpayment - interest
        if principal_paid <= 0:
            break
        balance = max(0, balance - principal_paid)
        months_with_overpayment += 1
        if months_with_overpayment > months_remaining * 2:
            break

    total_standard = standard_monthly * months_remaining
    total_interest_standard = total_standard - current_balance
    interest_saved = total_interest_standard - interest_with_op
    months_saved = months_remaining - months_with_overpayment

    capped = effective_overpayment < monthly_overpayment

    return {
        "standard_monthly": round(standard_monthly, 2),
        "effective_monthly_overpayment": round(effective_overpayment, 2),
        "capped_at_erc_limit": capped,
        "max_monthly_without_erc": round(monthly_limit, 2),
        "months_remaining_standard": months_remaining,
        "months_remaining_with_overpayment": months_with_overpayment,
        "months_saved": months_saved,
        "years_saved": round(months_saved / 12, 1),
        "interest_saved": round(interest_saved, 2),
    }


# ── Tool registry ──────────────────────────────────────────────────────────────

TOOLS = [
    {
        "name": "calculate_mortgage",
        "description": (
            "Full cost analysis for a single UK mortgage product. Handles repayment and "
            "interest-only, fee capitalisation, cashback, initial fixed/tracker period, "
            "and SVR reversion. Returns LTV, monthly payment, total cost, and true cost."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "property_value": {"type": "number", "description": "Property purchase price or current value in GBP"},
                "loan_amount": {"type": "number", "description": "Mortgage loan amount in GBP"},
                "annual_rate_percent": {"type": "number", "description": "Initial interest rate as a percentage, e.g. 4.29"},
                "term_years": {"type": "integer", "description": "Total mortgage term in years"},
                "repayment_type": {"type": "string", "enum": ["repayment", "interest_only"], "description": "Repayment method"},
                "arrangement_fee": {"type": "number", "description": "Lender arrangement/product fee in GBP (default 0)"},
                "add_fee_to_loan": {"type": "boolean", "description": "Whether to add arrangement fee to loan (capitalise)"},
                "cashback": {"type": "number", "description": "Any cashback incentive in GBP (default 0)"},
                "initial_period_years": {"type": "integer", "description": "Length of initial fixed/tracker period in years (0 if lifetime)"},
                "reversion_rate_percent": {"type": "number", "description": "SVR/reversion rate after initial period (only needed if initial_period_years > 0)"},
            },
            "required": ["property_value", "loan_amount", "annual_rate_percent", "term_years"],
        },
    },
    {
        "name": "compare_products",
        "description": (
            "Compare 2–8 UK mortgage products side by side. Ranks them by lowest monthly "
            "payment, lowest total true cost, and highest flexibility. Each product in the "
            "list must include a 'label' string plus all calculate_mortgage parameters. "
            "Optional per-product fields: 'flexibility_score' (1–10), 'erc_notes' (string)."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "products": {
                    "type": "array",
                    "minItems": 2,
                    "maxItems": 8,
                    "items": {
                        "type": "object",
                        "properties": {
                            "label": {"type": "string"},
                            "property_value": {"type": "number"},
                            "loan_amount": {"type": "number"},
                            "annual_rate_percent": {"type": "number"},
                            "term_years": {"type": "integer"},
                            "repayment_type": {"type": "string", "enum": ["repayment", "interest_only"]},
                            "arrangement_fee": {"type": "number"},
                            "add_fee_to_loan": {"type": "boolean"},
                            "cashback": {"type": "number"},
                            "initial_period_years": {"type": "integer"},
                            "reversion_rate_percent": {"type": "number"},
                            "flexibility_score": {"type": "number", "description": "1 (rigid) to 10 (very flexible)"},
                            "erc_notes": {"type": "string", "description": "ERC schedule summary, e.g. '5% yr1, 4% yr2, 3% yr3'"},
                        },
                        "required": ["label", "property_value", "loan_amount", "annual_rate_percent", "term_years"],
                    },
                }
            },
            "required": ["products"],
        },
    },
    {
        "name": "stress_test_affordability",
        "description": (
            "Stress-test mortgage affordability across multiple rate scenarios. "
            "Checks whether payments breach the 35% and 40% gross income rules "
            "at each scenario rate. Essential for assessing rate-rise risk."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "loan_amount": {"type": "number", "description": "Mortgage loan amount in GBP"},
                "term_years": {"type": "integer", "description": "Mortgage term in years"},
                "base_rate_percent": {"type": "number", "description": "Current/proposed initial rate"},
                "stress_rates_percent": {
                    "type": "array",
                    "items": {"type": "number"},
                    "description": "List of rates to stress-test, e.g. [5.0, 6.0, 7.0, 8.0]",
                },
                "gross_annual_income": {"type": "number", "description": "Borrower's gross annual income in GBP"},
                "monthly_committed_outgoings": {"type": "number", "description": "Monthly debt/committed outgoings excluding the mortgage"},
            },
            "required": ["loan_amount", "term_years", "base_rate_percent", "stress_rates_percent", "gross_annual_income"],
        },
    },
    {
        "name": "remortgage_analysis",
        "description": (
            "Full remortgage cost-benefit analysis. Accounts for early repayment charges (ERCs), "
            "arrangement fees, valuation and legal fees. Returns breakeven point and lifetime savings."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "current_balance": {"type": "number", "description": "Outstanding mortgage balance in GBP"},
                "current_rate_percent": {"type": "number", "description": "Current mortgage interest rate"},
                "months_remaining": {"type": "integer", "description": "Months remaining on current deal"},
                "erc_amount": {"type": "number", "description": "Early repayment charge in GBP (0 if outside fix period)"},
                "new_rate_percent": {"type": "number", "description": "Proposed new mortgage rate"},
                "new_term_years": {"type": "integer", "description": "New mortgage term in years"},
                "arrangement_fee": {"type": "number", "description": "New lender arrangement fee in GBP"},
                "valuation_legal_fees": {"type": "number", "description": "Estimated valuation + legal costs in GBP"},
            },
            "required": ["current_balance", "current_rate_percent", "months_remaining", "erc_amount", "new_rate_percent", "new_term_years"],
        },
    },
    {
        "name": "overpayment_analysis",
        "description": (
            "Calculate the interest saved and years knocked off a mortgage term "
            "through regular monthly overpayments. Respects the standard 10% per year "
            "ERC-free overpayment cap (configurable)."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "current_balance": {"type": "number", "description": "Current mortgage balance in GBP"},
                "annual_rate_percent": {"type": "number", "description": "Current interest rate"},
                "months_remaining": {"type": "integer", "description": "Remaining mortgage term in months"},
                "monthly_overpayment": {"type": "number", "description": "Desired extra monthly payment in GBP"},
                "max_annual_overpayment_pct": {"type": "number", "description": "ERC-free overpayment cap as % of balance (default 10)"},
            },
            "required": ["current_balance", "annual_rate_percent", "months_remaining", "monthly_overpayment"],
        },
    },
]


def _dispatch(tool_name: str, tool_input: dict):
    handlers = {
        "calculate_mortgage": calculate_mortgage,
        "compare_products": compare_products,
        "stress_test_affordability": stress_test_affordability,
        "remortgage_analysis": remortgage_analysis,
        "overpayment_analysis": overpayment_analysis,
    }
    fn = handlers.get(tool_name)
    if fn is None:
        return {"error": f"Unknown tool: {tool_name}"}
    return fn(**tool_input)


# ── System prompt ──────────────────────────────────────────────────────────────

SYSTEM = """You are Mortgage Brother — an elite UK Whole-of-Market Mortgage Advisor AI Agent.

Your expertise covers: residential mortgages, buy-to-let, remortgages, first-time buyers,
self-employed applications, adverse credit, portfolio landlords, bridging finance, and
Islamic/Shariah-compliant home finance.

CORE BEHAVIOUR
- Think like an elite independent mortgage broker.
- Use first-principles reasoning.
- Ask intelligent follow-up questions before recommending products.
- Never assume missing financial information — always ask.
- Distinguish between "best monthly payment" vs "best lifetime cost."
- Highlight hidden costs: arrangement fees, booking fees, valuation fees, broker fees,
  legal fees, ERCs (Early Repayment Charges), reversion/SVR rates.
- Consider both mainstream and specialist lenders.
- Flag affordability concerns and eligibility likelihood.
- Prioritise factual accuracy over pleasing the user.

MARKET COVERAGE
Evaluate across: high street lenders, challenger banks, building societies, specialist
lenders, digital mortgage lenders, Islamic finance providers, intermediary-only products.

Compare: fixed, tracker, discount, offset, interest-only, repayment, flexible mortgages;
BTL, limited company BTL, shared ownership, green mortgages, adverse credit products.

ANALYSIS TOOLS
You have access to calculation tools. Always run the numbers using these tools before
giving advice — never estimate costs from memory. Use compare_products for side-by-side
analysis, stress_test_affordability for rate-rise risk, and remortgage_analysis for
switching decisions.

OUTPUT STRUCTURE
Structure every substantive recommendation as:
1. Executive Summary
2. Key Assumptions
3. Recommended Products (with full calculated costs from tools)
4. Comparison Table
5. Affordability Analysis (including stress test)
6. Risks & Trade-Offs
7. Approval Probability Assessment
8. Strategic Recommendation
9. Questions / Missing Information

DISCLAIMER
You provide educational and research support, not regulated financial advice under the
Financial Services and Markets Act 2000. Users must confirm recommendations with an
FCA-regulated mortgage adviser before proceeding.

UK CONTEXT
All figures are in GBP. Use UK terminology: LTV, SVR, ERCs, APRC, Help to Buy, Stamp
Duty, SDLT, LISA, ICR (for BTL), stress rate, affordability multipliers, etc."""


# ── Agent loop ─────────────────────────────────────────────────────────────────

def run_agent(user_message: str, conversation_history: list | None = None) -> list:
    """
    Run one user turn through the agent loop. Returns updated conversation history.
    conversation_history allows multi-turn sessions.
    """
    if conversation_history is None:
        conversation_history = []

    conversation_history.append({"role": "user", "content": user_message})

    while True:
        response = client.messages.create(
            model=MODEL,
            max_tokens=8096,
            system=SYSTEM,
            tools=TOOLS,
            messages=conversation_history,
        )

        for block in response.content:
            if hasattr(block, "text") and block.text:
                print(block.text)

        if response.stop_reason != "tool_use":
            conversation_history.append({"role": "assistant", "content": response.content})
            break

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                print(f"\n[Running: {block.name}...]")
                result = _dispatch(block.name, block.input)
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps(result),
                    }
                )

        conversation_history.append({"role": "assistant", "content": response.content})
        conversation_history.append({"role": "user", "content": tool_results})

    return conversation_history


# ── Entry point ────────────────────────────────────────────────────────────────

WELCOME = """
╔══════════════════════════════════════════════════════════════════╗
║          MORTGAGE BROTHER — UK Whole-of-Market Advisor           ║
║  Educational tool. Not regulated financial advice.               ║
╚══════════════════════════════════════════════════════════════════╝

Hello! I'm Mortgage Brother, your UK mortgage research agent.

I can help you with:
  • Comparing mortgage products across the whole market
  • Remortgage analysis (including ERC calculations)
  • First-time buyer affordability & LTV scenarios
  • Buy-to-let ICR and stress testing
  • Overpayment strategy
  • Self-employed, adverse credit, and specialist cases

To get started, tell me about your situation — property value, loan
needed, income, and what you're trying to achieve.

Type 'quit' to exit.
"""


def main():
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
        run_agent(query)
        return

    print(WELCOME)
    history = []
    try:
        while True:
            user_input = input("\nYou: ").strip()
            if not user_input:
                continue
            if user_input.lower() in {"quit", "exit", "q"}:
                print("\nGoodbye — remember to verify any recommendations with an FCA-regulated adviser.")
                break
            print()
            history = run_agent(user_input, history)
    except (KeyboardInterrupt, EOFError):
        print("\n\nGoodbye!")


if __name__ == "__main__":
    main()
