import { createSlice } from '@reduxjs/toolkit';

// ================ Cart Duck ================ //
// Client-side cart with localStorage persistence.
// Supports items from multiple providers (multi-renter).

const STORAGE_KEY = 'dd_cart';

const readCartFromStorage = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const writeCartToStorage = items => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage might be full or unavailable
  }
};

const initialState = {
  items: [], // [{ listingId, providerId, providerName, quantity, title, price, imageUrl, addedAt }]
  isOpen: false, // Cart drawer visibility
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    loadFromStorage(state) {
      state.items = readCartFromStorage();
    },

    addToCart(state, action) {
      const { listingId, providerId, providerName, title, price, imageUrl } = action.payload;
      const existingIndex = state.items.findIndex(item => item.listingId === listingId);

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += 1;
      } else {
        state.items.push({
          listingId,
          providerId,
          providerName,
          title,
          price,
          imageUrl,
          quantity: 1,
          addedAt: new Date().toISOString(),
        });
      }

      writeCartToStorage(state.items);
    },

    removeFromCart(state, action) {
      const { listingId } = action.payload;
      state.items = state.items.filter(item => item.listingId !== listingId);
      writeCartToStorage(state.items);
    },

    updateQuantity(state, action) {
      const { listingId, quantity } = action.payload;
      const item = state.items.find(i => i.listingId === listingId);
      if (item && quantity > 0) {
        item.quantity = quantity;
        writeCartToStorage(state.items);
      }
    },

    clearCart(state) {
      state.items = [];
      writeCartToStorage([]);
    },

    toggleDrawer(state) {
      state.isOpen = !state.isOpen;
    },

    setDrawerOpen(state, action) {
      state.isOpen = action.payload;
    },
  },
});

export const {
  loadFromStorage,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleDrawer,
  setDrawerOpen,
} = cartSlice.actions;

// ================ Selectors ================ //

export const selectCartItems = state => state.cart.items;
export const selectCartIsOpen = state => state.cart.isOpen;

export const selectCartItemCount = state =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartByProvider = state => {
  const items = state.cart.items;
  const grouped = {};
  items.forEach(item => {
    const key = item.providerId;
    if (!grouped[key]) {
      grouped[key] = { providerId: key, providerName: item.providerName, items: [] };
    }
    grouped[key].items.push(item);
  });
  return Object.values(grouped);
};

export const selectCartTotal = state =>
  state.cart.items.reduce((total, item) => {
    const amount = item.price?.amount || 0;
    return total + amount * item.quantity;
  }, 0);

export default cartSlice.reducer;
