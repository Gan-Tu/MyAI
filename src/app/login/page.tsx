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

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Login",
  description: "Sign in to your account to continue.",
};

export default function Login() {
  return (
    <div className="flex h-dvh content-center">
      <div className="mx-auto my-auto w-96 rounded-xl bg-white shadow-md ring-1 ring-black/5">
        <LoginForm />
      </div>
    </div>
  );
}
