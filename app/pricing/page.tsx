import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata: Metadata = { title: "Pricing" };

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Build your first useful shelf.",
    features: [
      "Public game links",
      "Basic scans and screenshots",
      "Public library browsing",
      "Three private drafts",
    ],
    cta: "Start free",
    href: "/submit",
  },
  {
    name: "Teacher Pro",
    price: "$7",
    cadence: "per month",
    description: "For teachers who make games weekly.",
    features: [
      "Unlimited private collections",
      "Re-scans and custom thumbnails",
      "Self-contained HTML hosting",
      "Expanded AI scan credits",
      "Teaching analytics",
    ],
    cta: "Join the early list",
    href: "/sign-in",
    featured: true,
  },
  {
    name: "School",
    price: "Custom",
    cadence: "for your staff",
    description: "One trusted library for the whole school.",
    features: [
      "Shared school collection",
      "Teacher and admin roles",
      "Moderation approval flow",
      "Internal-only games",
      "School usage reporting",
    ],
    cta: "Talk to us",
    href: "/safety",
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="pricing-hero">
        <div className="shell">
          <p className="eyebrow">Simple, teacher-friendly pricing</p>
          <h1>Free to begin. Worth paying for when your shelf becomes essential.</h1>
          <p>No payment flow is active during the private production preview.</p>
        </div>
      </section>
      <section className="shell pricing-grid">
        {plans.map((plan) => (
          <article
            className={`price-card panel ${plan.featured ? "featured" : ""}`}
            key={plan.name}
          >
            {plan.featured && <span className="price-card__flag">Most useful</span>}
            <p className="overline">{plan.name}</p>
            <div className="price">
              <strong>{plan.price}</strong>
              <span>{plan.cadence}</span>
            </div>
            <p>{plan.description}</p>
            <div className="price-features">
              {plan.features.map((feature) => (
                <span key={feature}>
                  <Check size={16} /> {feature}
                </span>
              ))}
            </div>
            <Link
              className={`button button--full ${
                plan.featured ? "button--sun" : "button--secondary"
              }`}
              href={plan.href}
            >
              {plan.cta}
            </Link>
          </article>
        ))}
      </section>
    </>
  );
}
