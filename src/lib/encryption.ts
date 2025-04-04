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

import crypto from 'crypto'

const ALGORITHM = 'aes-256-ctr'

// secret must be 32 bytes for aes-256-ctr
// For example, generate with: crypto.randomBytes(32).toString('hex')

export function encrypt(text: string, secret: string) {
  const encryptionKey = Buffer.from(secret, 'hex')
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
  }
}

export interface EncryptedObject {
  iv: string;
  content: string;
}

export function decrypt(encryptedObj: EncryptedObject, secret: string): string {
  const encryptionKey = Buffer.from(secret, 'hex')
  const { iv, content } = encryptedObj
  const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, Buffer.from(iv, 'hex'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()])
  return decrypted.toString('utf8')
}
