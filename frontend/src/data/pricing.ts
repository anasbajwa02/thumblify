import type { IPricing } from "../types";

export const pricingData: IPricing[] = [
    {
        name: "Basic",
        price: 9,
        period: "month",
        features: [
            "50 Premium AI Thumbnails",
            "Best for starters",
            "Access to all AI models",
            "No watermark on downloads",
            "High-quality",
            "Commercial usage allowed",
            "Credits never expire"
        ],
        mostPopular: false
    },
    {
        name: "Pro",
        price: 19,
        period: "month",
        features: [
            "110 Premium AI Thumbnails",
            "Best for intermediate",
            "Access to all AI models",
             "No watermark on downloads",
            "High-quality",
            "Commercial usage allowed",
            "Credits never expire"
        ],
        mostPopular: true
    },
    {
        name: "Enterprise",
        price: 49,
        period: "month",
        features: [
            "280 Premium AI Thumbnails",
            "Best for intermediate",
            "Access to all AI models",
             "No watermark on downloads",
            "High-quality",
            "Commercial usage allowed",
            "Credits never expire"
        ],
        mostPopular: false
    }
];