import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import {
  createAccessProof,
  decryptOverrides,
  encryptFlagDefinitions,
  encryptFlagValues,
  encryptOverrides,
  verifyAccess,
} from 'flags';

const secret = randomBytes(32).toString('base64url');

test('discovery accepts a valid access proof', async () => {
  const proof = await createAccessProof(secret);
  assert.equal(await verifyAccess(`Bearer ${proof}`, secret), true);
});

test('discovery rejects other encrypted flag tokens', async () => {
  const tokens = await Promise.all([
    encryptOverrides({ 'enable-login': false }, secret),
    encryptFlagValues({ 'enable-login': false }, secret),
    encryptFlagDefinitions({ 'enable-login': {} }, secret),
  ]);
  for (const token of tokens) {
    assert.equal(await verifyAccess(`Bearer ${token}`, secret), false);
  }
});

test('discovery rejects missing, malformed, expired, and foreign proofs', async () => {
  const expired = await createAccessProof(secret, '-1h');
  const foreign = await createAccessProof(randomBytes(32).toString('base64url'));
  for (const header of [null, 'Bearer invalid', `Bearer ${expired}`, `Bearer ${foreign}`]) {
    assert.equal(await verifyAccess(header, secret), false);
  }
});

test('legitimate login and credit overrides still round-trip', async () => {
  const overrides = { 'enable-login': false, 'enable-credits': true };
  assert.deepEqual(
    await decryptOverrides(await encryptOverrides(overrides, secret), secret),
    overrides,
  );
});
