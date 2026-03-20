export const DEFAULT_CATEGORIES = [
  { id: 'dillon',    label: 'Dillon',     defaultLimit: 100, color: '#007AFF' },
  { id: 'madeline',  label: 'Madeline',   defaultLimit: 100, color: '#FF2D55' },
  { id: 'kids',      label: 'Kids',       defaultLimit: 180, color: '#FF9500' },
  { id: 'diningOut', label: 'Dining Out', defaultLimit: 200, color: '#34C759' },
];

// Keep CATEGORIES as alias so existing imports still work
export const CATEGORIES = DEFAULT_CATEGORIES;

export const DEFAULT_LIMITS = {
  dillon:    100,
  madeline:  100,
  kids:      180,
  diningOut: 200,
};

export const TOTAL_DEFAULT_BUDGET = 580;

export const PRESET_COLORS = [
  '#007AFF', '#FF2D55', '#FF9500', '#34C759',
  '#AF52DE', '#5856D6', '#FF3B30', '#5AC8FA',
  '#FFCC00', '#FF6B6B', '#00C7BE', '#30D158',
];
