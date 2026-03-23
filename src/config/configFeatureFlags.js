//////////////////////////////////////////////////////
// Feature flags for Dear Danielle MVP              //
// Toggle features on/off independently             //
//////////////////////////////////////////////////////

// Each flag can be overridden via environment variables:
// REACT_APP_FF_ENABLE_FASHION_CATEGORIES=true (etc.)

export const featureFlags = {
  // Fashion product categories (Dresses, Tops, Bottoms, etc.)
  enableFashionCategories: true,

  // Closet style favoriting (heart icon on listings, /favorites page)
  enableFavoriting: true,

  // Shipping-first flow (keyword search, no location dependency)
  enableShippingFirstFlow: true,

  // Cart with multi-renter support (items from multiple providers)
  enableCart: true,

  // Configurable card holds (manual capture via fashion-rental process)
  enableCardHolds: true,

  // Multi-user product management (listing collaborators)
  enableMultiUserManagement: true,

  // T-shirt size selection on listings
  enableSizeSelection: true,

  // Occasion-based tags and filtering
  enableOccasionTags: true,

  // AI-powered listing description assistance
  enableAIListingAssistance: true,
};
