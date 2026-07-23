import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  selectedDataSourceId: number | null;
  theme: 'light' | 'dark';
}

const getStoredDataSourceId = (): number | null => {
  const stored = localStorage.getItem('selectedDataSourceId');
  return stored ? parseInt(stored, 10) : null;
};

const initialState: UiState = {
  sidebarOpen: true,
  selectedDataSourceId: getStoredDataSourceId(),
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSelectedDataSource: (state, action: PayloadAction<number | null>) => {
      state.selectedDataSourceId = action.payload;
      if (action.payload) {
        localStorage.setItem('selectedDataSourceId', action.payload.toString());
      } else {
        localStorage.removeItem('selectedDataSourceId');
      }
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { toggleSidebar, setSelectedDataSource, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
