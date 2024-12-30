import { unstable_flag as flag } from '@vercel/flags/next';

export const getEnableLogin = flag<boolean>({
  key: 'enable-login',
  async decide() {
    return false;
  },
  description: 'Whether to enable login/logout',
  defaultValue: false,
  options: [
    { value: false, label: 'on' },
    { value: true, label: 'off' },
  ],
});
