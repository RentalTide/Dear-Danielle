//////////////////////////////////////////////////////
// Feature flags for Dear Danielle MVP              //
// Toggle features on/off independently             //
//////////////////////////////////////////////////////

// Each flag can be overridden via environment variables:
// REACT_APP_FF_ENABLE_FASHION_CATEGORIES=true (etc.)

export const featureFlags = {
  // Closet style favoriting (heart icon on listings, /favorites page)
  enableFavoriting: true,

  // Shipping-first flow (keyword search, no location dependency)
  enableShippingFirstFlow: true,

  // Cart with multi-renter support (items from multiple providers)
  enableCart: true,

  // Configurable card holds (manual capture via fashion-rental process)
  enableCardHolds: true,

  // Card hold configuration
  cardHold: {
    // Hold amount in cents (e.g. 5000 = $50.00). Set to 0 to hold the full rental price.
    holdAmountCents: 0,
    // Number of days the hold lasts before auto-capture
    holdDurationDays: 7,
    // Number of days before auto-decline (refund) if provider doesn't respond
    autoDeclineDays: 14,
  },

  // Multi-user product management (listing collaborators)
  enableMultiUserManagement: true,

  // AI-powered listing description assistance
  enableAIListingAssistance: true,
};
