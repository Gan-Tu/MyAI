// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
    return true;
  },
  description: 'Whether to enable credits usage tracking/limiting',
  defaultValue: false,
  options: [
    { value: false, label: 'on' },
    { value: true, label: 'off' },
  ],
});
