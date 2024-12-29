import { unstable_flag as flag } from '@vercel/flags/next';

export const getShowLogin = flag<boolean>({
  key: 'show-login',
  async decide() {
    return false;
  },
  description: 'Whether to show login endpoint',
  defaultValue: false,
  options: [
    { value: false, label: 'on' },
    { value: true, label: 'off' },
  ],
});
