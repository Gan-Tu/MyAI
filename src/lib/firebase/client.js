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

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKhMgX3MnPHq6Jnlz8rPXMohgGW35Th4Q",
  authDomain: "auth.mycool.ai",
  projectId: "myai-51dcc",
  storageBucket: "myai-51dcc.firebasestorage.app",
  messagingSenderId: "1063594001354",
  appId: "1:1063594001354:web:c4946d4e8244eac30e0533",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
