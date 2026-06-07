// End-to-end encryption for DMs (NaCl box / X25519 + XSalsa20-Poly1305).
// The private key is generated on-device and stored in the OS keychain
// (expo-secure-store); only the PUBLIC key is uploaded. The server therefore
// only ever stores ciphertext for DMs — neither the server nor an admin can read
// them. Guild channels are NOT encrypted (so they stay moderatable).
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import nacl from "tweetnacl";
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from "tweetnacl-util";
import { supabase } from "./supabase";

// tweetnacl needs a CSPRNG; expo-crypto provides one that works in Expo Go.
nacl.setPRNG((x, n) => {
  const bytes = Crypto.getRandomBytes(n);
  for (let i = 0; i < n; i++) x[i] = bytes[i];
});

const SK_KEY = "tabor.dm.secretkey.v1";
let _secret: Uint8Array | null = null;

/** Ensure this device has a keypair, the private key is in the keychain, and the
 *  public key is published to the user's profile. Call after sign-in. */
export async function ensureKeys(userId: string): Promise<void> {
  let b64 = await SecureStore.getItemAsync(SK_KEY);
  if (!b64) {
    const kp = nacl.box.keyPair();
    b64 = encodeBase64(kp.secretKey);
    await SecureStore.setItemAsync(SK_KEY, b64);
  }
  _secret = decodeBase64(b64);
  const pub = encodeBase64(nacl.box.keyPair.fromSecretKey(_secret).publicKey);
  // publish public key if missing/changed
  const { data } = await supabase.from("profiles").select("public_key").eq("user_id", userId).maybeSingle();
  if (data?.public_key !== pub) await supabase.from("profiles").update({ public_key: pub }).eq("user_id", userId);
}

async function secret(): Promise<Uint8Array | null> {
  if (_secret) return _secret;
  const b64 = await SecureStore.getItemAsync(SK_KEY);
  if (!b64) return null;
  _secret = decodeBase64(b64);
  return _secret;
}

/** Encrypt a message for a recipient (their base64 public key). Returns a JSON
 *  string {n, c} (nonce + ciphertext), or null if keys are missing. */
export async function encryptDM(recipientPublicKey: string, message: string): Promise<string | null> {
  const sk = await secret();
  if (!sk || !recipientPublicKey) return null;
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const box = nacl.box(decodeUTF8(message), nonce, decodeBase64(recipientPublicKey), sk);
  return JSON.stringify({ n: encodeBase64(nonce), c: encodeBase64(box) });
}

/** Decrypt a stored DM body from a sender (their base64 public key). */
export async function decryptDM(senderPublicKey: string, body: string | null): Promise<string> {
  if (!body) return "";
  let payload: { n: string; c: string };
  try { payload = JSON.parse(body); } catch { return body; } // legacy/plain
  if (!payload?.n || !payload?.c) return body;
  const sk = await secret();
  if (!sk || !senderPublicKey) return "[encrypted]";
  const opened = nacl.box.open(decodeBase64(payload.c), decodeBase64(payload.n), decodeBase64(senderPublicKey), sk);
  return opened ? encodeUTF8(opened) : "[unable to decrypt]";
}

export async function getPublicKey(userId: string): Promise<string | null> {
  const { data } = await supabase.from("profiles").select("public_key").eq("user_id", userId).maybeSingle();
  return data?.public_key ?? null;
}
