import { createFlagsDiscoveryEndpoint, getProviderData } from 'flags/next';
import { getEnableCredits, getEnableLogin } from '@/lib/flags';

export const GET = createFlagsDiscoveryEndpoint(async () =>
  getProviderData({ getEnableCredits, getEnableLogin }),
);
