import { createSlice } from '@reduxjs/toolkit';
import { fetchFavoriteListingsThunk, loadFavorites } from '../../ducks/favorites.duck';

// ================ Page-level duck for FavoritesPage ================ //

// This page uses the shared favorites duck for most state.
// The page duck provides loadData for SSR and a minimal reducer.

const favoritesPageSlice = createSlice({
  name: 'FavoritesPage',
  initialState: {},
  reducers: {},
});

export const loadData = () => (dispatch, getState) => {
  dispatch(loadFavorites());
  return dispatch(fetchFavoriteListingsThunk());
};

export default favoritesPageSlice.reducer;
