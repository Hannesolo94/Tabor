-- E2EE for DMs: each user publishes an X25519 public key; the private key never
-- leaves the device (stored in the OS keychain via expo-secure-store). DM bodies
-- are encrypted client-side (NaCl box), so the server only ever stores ciphertext.
alter table public.profiles add column if not exists public_key text;
