import { unstable_flag as flag } from '@vercel/flags/next';

export const getEnableLogin = flag<boolean>({
  key: 'enable-login',
  async decide() {
    return true;
  },
  description: 'Whether to enable login/logout',
  defaultValue: false,
  options: [
    { value: false, label: 'on' },
    { value: true, label: 'off' },
  ],
});

export const getEnableCredits = flag<boolean>({
  key: 'enable-credits',
  async decide() {
    return false;
  },
  description: 'Whether to enable credits usage tracking/limiting',
  defaultValue: false,
  options: [
    { value: false, label: 'on' },
    { value: true, label: 'off' },
  ],
});
