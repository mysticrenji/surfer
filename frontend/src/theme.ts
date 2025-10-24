import { createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';

// Define your shadows. MUI expects exactly 25 entries (a tuple).
const rawShadows = [
  'none',
  '0px 1px 2px rgba(0,0,0,0.04)',
  '0px 1px 3px rgba(0,0,0,0.06)',
  '0px 2px 4px rgba(0,0,0,0.05)',
  '0px 4px 6px rgba(0,0,0,0.07)',
  '0px 6px 10px rgba(0,0,0,0.08)',
  '0px 8px 12px rgba(0,0,0,0.09)',
  '0px 10px 14px rgba(0,0,0,0.10)',
  '0px 12px 16px rgba(0,0,0,0.11)',
  '0px 14px 18px rgba(0,0,0,0.12)',
  '0px 16px 20px rgba(0,0,0,0.13)',
  '0px 18px 22px rgba(0,0,0,0.14)',
  '0px 20px 24px rgba(0,0,0,0.15)',
  '0px 22px 26px rgba(0,0,0,0.16)',
  '0px 24px 28px rgba(0,0,0,0.17)',
  '0px 26px 30px rgba(0,0,0,0.18)',
  '0px 28px 32px rgba(0,0,0,0.19)',
  '0px 30px 34px rgba(0,0,0,0.20)',
  '0px 32px 36px rgba(0,0,0,0.21)',
  '0px 34px 38px rgba(0,0,0,0.22)',
  '0px 36px 40px rgba(0,0,0,0.23)',
  '0px 38px 42px rgba(0,0,0,0.24)',
  '0px 40px 44px rgba(0,0,0,0.25)',
  '0px 42px 46px rgba(0,0,0,0.26)',
  '0px 44px 48px rgba(0,0,0,0.27)',
];

// Normalize to exactly 25 entries to satisfy MUI's Shadows tuple type.
const shadows: Shadows = (() => {
  const normalized = rawShadows.slice(0, 25);
  while (normalized.length < 25) normalized.push('none');
  // Shadows is a tuple type; assert after ensuring length
  return normalized as unknown as Shadows;
})();

const theme = createTheme({
  shadows,
  // add other theme customization here if needed
});

export default theme;