import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  activeTab: string;
}

const initialState: UIState = {
  activeTab: 'overview',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = uiSlice.actions;

export default uiSlice.reducer; 