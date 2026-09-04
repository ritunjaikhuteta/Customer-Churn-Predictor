"""
ChurnIQ — Recommendation Service
Deterministic rule-based retention recommendations.
No external LLM required.
"""
from typing import List, Dict, Any


def generate_recommendations(customer: Dict[str, Any], risk_level: str, churn_probability: float) -> List[str]:
    """
    Generate actionable retention recommendations based on customer attributes
    and churn probability using deterministic business rules.
    """
    recommendations = []

    # Contract-based rules
    if customer.get("Contract") == "Month-to-month":
        recommendations.append("Offer a discounted 12-month or 24-month commitment plan to improve loyalty.")

    # Tech support rule
    if customer.get("TechSupport") in ("No", "No internet service"):
        recommendations.append("Provide complimentary or discounted technical support add-on.")

    # Online security rule
    if customer.get("OnlineSecurity") in ("No", "No internet service"):
        recommendations.append("Offer a free trial of the Online Security package to increase perceived value.")

    # Payment method rule
    if customer.get("PaymentMethod") == "Electronic check":
        recommendations.append("Encourage enrollment in automatic bank transfer or credit card autopay with a billing incentive.")

    # Short tenure rule
    if isinstance(customer.get("tenure"), (int, float)) and customer["tenure"] < 12:
        recommendations.append("Assign a dedicated account manager or proactive onboarding support for new customers.")

    # High monthly charges
    monthly = customer.get("MonthlyCharges", 0)
    if isinstance(monthly, (int, float)) and monthly > 70:
        recommendations.append("Review current plan and offer a tailored bundle discount to reduce perceived cost.")

    # Fiber optic without security/backup
    if customer.get("InternetService") == "Fiber optic":
        if customer.get("OnlineBackup") in ("No", "No internet service"):
            recommendations.append("Offer a free Online Backup add-on for Fiber optic subscribers to increase stickiness.")

    # Senior citizens
    if customer.get("SeniorCitizen") == 1:
        recommendations.append("Offer a senior loyalty program with dedicated support and simplified billing.")

    # No partner, no dependents and high risk
    if (customer.get("Partner") == "No" and
            customer.get("Dependents") == "No" and
            risk_level == "High"):
        recommendations.append("Consider targeted outreach campaign for single-subscriber high-risk accounts.")

    # Streaming but no security
    streaming = (customer.get("StreamingTV") == "Yes" or customer.get("StreamingMovies") == "Yes")
    if streaming and customer.get("OnlineSecurity") == "No":
        recommendations.append("Bundle streaming services with online security at a discounted rate to add value.")

    # Paperless billing + electronic check combo (high fraud/churn risk)
    if customer.get("PaperlessBilling") == "Yes" and customer.get("PaymentMethod") == "Electronic check":
        recommendations.append("Provide billing transparency tools and notifications to reduce payment-related friction.")

    # Default recommendation for any high-risk customer
    if risk_level == "High" and len(recommendations) < 2:
        recommendations.append("Schedule a proactive customer success call to understand pain points and offer targeted incentives.")

    # Remove duplicates while preserving order
    seen = set()
    unique = []
    for r in recommendations:
        if r not in seen:
            seen.add(r)
            unique.append(r)

    return unique[:6]  # Cap at 6 recommendations


def generate_retention_insight(customer: Dict[str, Any], risk_level: str, churn_probability: float, top_factors: List[Dict]) -> str:
    """
    Generate a natural-language retention insight from deterministic rules.
    Phrased conservatively — uses 'may help', 'consider', not guarantees.
    """
    risk_pct = round(churn_probability * 100, 1)
    factor_names = [f["feature"] for f in top_factors[:3]] if top_factors else []

    # Build insight sentence
    parts = []

    if risk_level == "High":
        parts.append(f"This customer shows elevated churn risk ({risk_pct}%).")
    elif risk_level == "Medium":
        parts.append(f"This customer shows moderate churn risk ({risk_pct}%) with several attention points.")
    else:
        parts.append(f"This customer appears relatively stable with a low churn probability ({risk_pct}%).")

    # Key driver sentence
    if factor_names:
        driver_text = ", ".join(factor_names[:2])
        parts.append(f"Primary risk indicators include: {driver_text}.")

    # Actionable suggestion
    if customer.get("Contract") == "Month-to-month":
        parts.append("Moving to a longer-term plan could reduce churn risk significantly.")
    if customer.get("TechSupport") in ("No", "No internet service"):
        parts.append("Adding technical support coverage may improve customer satisfaction.")
    if isinstance(customer.get("tenure"), (int, float)) and customer["tenure"] < 12:
        parts.append("Early-stage customers benefit most from proactive engagement programs.")

    if risk_level == "Low":
        parts.append("Continued proactive communication may help maintain retention.")

    return " ".join(parts)
