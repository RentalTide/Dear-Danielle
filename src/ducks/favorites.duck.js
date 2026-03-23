import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import * as log from '../util/log';
import { storableError } from '../util/errors';
import { addMarketplaceEntities } from './marketplaceData.duck';

// ================ Async thunks ================ //

/**
 * Toggle a listing as favorite. Reads the current user's privateData.favorites,
 * adds or removes the listing ID, and updates the profile.
 */
const toggleFavoritePayloadCreator = ({ listingId }, { getState, extra: sdk, rejectWithValue }) => {
  const currentUser = getState().user?.currentUser;
  const currentFavorites = currentUser?.attributes?.profile?.privateData?.favorites || [];
  const listingIdStr = listingId?.uuid || listingId;

  const isFavorited = currentFavorites.includes(listingIdStr);
  const updatedFavorites = isFavorited
    ? currentFavorites.filter(id => id !== listingIdStr)
    : [...currentFavorites, listingIdStr];

  return sdk.currentUser
    .updateProfile({ privateData: { favorites: updatedFavorites } }, { expand: true })
    .then(response => {
      return { favoriteIds: updatedFavorites, listingId: listingIdStr, isFavorited: !isFavorited };
    })
    .catch(e => {
      const error = storableError(e);
      log.error(error, 'toggle-favorite-failed');
      return rejectWithValue(error);
    });
};

export const toggleFavoriteThunk = createAsyncThunk(
  'favorites/toggleFavorite',
  toggleFavoritePayloadCreator
);

// Backward compatible wrapper
export const toggleFavorite = listingId => dispatch => {
  return dispatch(toggleFavoriteThunk({ listingId })).unwrap();
};

/**
 * Fetch listing entities for all favorited listing IDs.
 */
const fetchFavoriteListingsPayloadCreator = (_, { getState, extra: sdk, dispatch, rejectWithValue }) => {
  const currentUser = getState().user?.currentUser;
  const favoriteIds = currentUser?.attributes?.profile?.privateData?.favorites || [];

  if (favoriteIds.length === 0) {
    return { data: [] };
  }

  return sdk.listings
    .query({
      ids: favoriteIds,
      include: ['author', 'images'],
      'fields.listing': ['title', 'price', 'publicData', 'state'],
      'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
      'fields.image': ['variants.listing-card', 'variants.listing-card-2x'],
      'limit.images': 1,
    })
    .then(response => {
      dispatch(addMarketplaceEntities(response));
      return { data: response.data.data.map(l => l.id) };
    })
    .catch(e => {
      const error = storableError(e);
      log.error(error, 'fetch-favorite-listings-failed');
      return rejectWithValue(error);
    });
};

export const fetchFavoriteListingsThunk = createAsyncThunk(
  'favorites/fetchFavoriteListings',
  fetchFavoriteListingsPayloadCreator
);

export const fetchFavoriteListings = () => dispatch => {
  return dispatch(fetchFavoriteListingsThunk()).unwrap();
};

// ================ Slice ================ //

const initialState = {
  favoriteIds: [],
  favoriteListingRefs: [],
  toggleInProgress: false,
  toggleError: null,
  fetchInProgress: false,
  fetchError: null,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavoriteIds(state, action) {
      state.favoriteIds = action.payload;
    },
  },
  extraReducers: builder => {
    // Toggle favorite
    builder.addCase(toggleFavoriteThunk.pending, state => {
      state.toggleInProgress = true;
      state.toggleError = null;
    });
    builder.addCase(toggleFavoriteThunk.fulfilled, (state, action) => {
      state.toggleInProgress = false;
      state.favoriteIds = action.payload.favoriteIds;
    });
    builder.addCase(toggleFavoriteThunk.rejected, (state, action) => {
      state.toggleInProgress = false;
      state.toggleError = action.payload;
    });

    // Fetch favorite listings
    builder.addCase(fetchFavoriteListingsThunk.pending, state => {
      state.fetchInProgress = true;
      state.fetchError = null;
    });
    builder.addCase(fetchFavoriteListingsThunk.fulfilled, (state, action) => {
      state.fetchInProgress = false;
      state.favoriteListingRefs = action.payload.data;
    });
    builder.addCase(fetchFavoriteListingsThunk.rejected, (state, action) => {
      state.fetchInProgress = false;
      state.fetchError = action.payload;
    });
  },
});

export const { setFavoriteIds } = favoritesSlice.actions;

// ================ Selectors ================ //

export const selectFavoriteIds = state => state.favorites.favoriteIds;
export const selectToggleInProgress = state => state.favorites.toggleInProgress;
export const selectFetchInProgress = state => state.favorites.fetchInProgress;

// ================ Action to initialize from currentUser ================ //

export const loadFavorites = () => (dispatch, getState) => {
  const currentUser = getState().user?.currentUser;
  const favoriteIds = currentUser?.attributes?.profile?.privateData?.favorites || [];
  dispatch(setFavoriteIds(favoriteIds));
};

export default favoritesSlice.reducer;
