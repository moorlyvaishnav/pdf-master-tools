import {
  PDFArray,
  PDFDict,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFStream,
  PDFString,
  type PDFDocument,
  type PDFObject,
} from "pdf-lib";
import { nextFrame, ToolError, type ProgressCallback } from "./files";
import { loadPdf } from "./load";

/*
 * PDF password protection with AES-256 (PDF 2.0 standard security handler,
 * revision 6: /V 5 /R 6, crypt filter AESV3), implemented with the browser's
 * WebCrypto API. Every string and stream in the document is encrypted with a
 * random 256-bit file key; the key is protected by the password using the
 * PDF 2.0 key-derivation algorithm (SHA-256/384/512 + AES, ISO 32000-2 7.6.4.3).
 *
 * This is the same scheme Adobe Acrobat uses for "AES-256" protection. As with
 * any password protection, it is only as strong as the password chosen.
 */

const subtle = () => {
  const s = globalThis.crypto?.subtle;
  if (!s) throw new ToolError("Your browser does not support secure encryption here. Make sure the page is opened over https.");
  return s;
};

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

function random(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

function buf(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function digest(algorithm: "SHA-256" | "SHA-384" | "SHA-512", data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await subtle().digest(algorithm, buf(data)));
}

/** AES-CBC encryption of block-aligned data without padding (WebCrypto always pads, so drop the pad block). */
async function aesCbcNoPad(keyBytes: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const key = await subtle().importKey("raw", buf(keyBytes), { name: "AES-CBC" }, false, ["encrypt"]);
  const out = new Uint8Array(await subtle().encrypt({ name: "AES-CBC", iv: buf(iv) }, key, buf(data)));
  return out.subarray(0, data.length);
}

/** ISO 32000-2 Algorithm 2.B: hardened password hash for revision 6. */
async function hash2B(password: Uint8Array, salt: Uint8Array, userKey: Uint8Array): Promise<Uint8Array> {
  let k = await digest("SHA-256", concat(password, salt, userKey));
  for (let round = 0; ; round++) {
    const block = concat(password, k, userKey);
    const k1 = new Uint8Array(block.length * 64);
    for (let i = 0; i < 64; i++) k1.set(block, i * block.length);
    const e = await aesCbcNoPad(k.subarray(0, 16), k.subarray(16, 32), k1);
    let sum = 0;
    for (let i = 0; i < 16; i++) sum += e[i];
    const algorithm = sum % 3 === 0 ? "SHA-256" : sum % 3 === 1 ? "SHA-384" : "SHA-512";
    k = await digest(algorithm, e);
    if (round >= 63 && e[e.length - 1] <= round - 31) break;
  }
  return k.subarray(0, 32);
}

/** Passwords are UTF-8 (normalised), truncated to 127 bytes as the PDF standard requires. */
export function passwordBytes(password: string): Uint8Array {
  return new TextEncoder().encode(password.normalize("NFKC")).subarray(0, 127);
}

/** Permission flags: all operations allowed (the password protects opening the file). */
const ALL_PERMISSIONS = -4; // 0xFFFFFFFC, bits 1-2 must be zero

interface SecurityValues {
  fileKey: Uint8Array;
  O: Uint8Array;
  U: Uint8Array;
  OE: Uint8Array;
  UE: Uint8Array;
  Perms: Uint8Array;
}

async function createSecurityValues(userPassword: string, ownerPassword: string): Promise<SecurityValues> {
  const fileKey = random(32);
  const zeroIv = new Uint8Array(16);
  const user = passwordBytes(userPassword);
  const owner = passwordBytes(ownerPassword);

  const userValidationSalt = random(8);
  const userKeySalt = random(8);
  const U = concat(await hash2B(user, userValidationSalt, new Uint8Array(0)), userValidationSalt, userKeySalt);
  const UE = await aesCbcNoPad(await hash2B(user, userKeySalt, new Uint8Array(0)), zeroIv, fileKey);

  const ownerValidationSalt = random(8);
  const ownerKeySalt = random(8);
  const O = concat(await hash2B(owner, ownerValidationSalt, U), ownerValidationSalt, ownerKeySalt);
  const OE = await aesCbcNoPad(await hash2B(owner, ownerKeySalt, U), zeroIv, fileKey);

  const perms = new Uint8Array(16);
  new DataView(perms.buffer).setInt32(0, ALL_PERMISSIONS, true);
  perms.set([0xff, 0xff, 0xff, 0xff], 4);
  perms.set([0x54 /* T: metadata encrypted */, 0x61, 0x64, 0x62 /* "adb" */], 8);
  perms.set(random(4), 12);
  const Perms = await aesCbcNoPad(fileKey, zeroIv, perms); // single block = ECB

  return { fileKey, O, U, OE, UE, Perms };
}

/** AES-256-CBC with random IV and PKCS#7 padding, IV prepended (crypt filter AESV3). */
async function encryptData(key: CryptoKey, data: Uint8Array): Promise<Uint8Array> {
  const iv = random(16);
  const cipher = new Uint8Array(await subtle().encrypt({ name: "AES-CBC", iv: buf(iv) }, key, buf(data)));
  return concat(iv, cipher);
}

function toHex(bytes: Uint8Array): string {
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

/** Encrypt every string inside an object (recursively). Returns the replacement object. */
async function encryptStrings(object: PDFObject, key: CryptoKey): Promise<PDFObject> {
  if (object instanceof PDFString || object instanceof PDFHexString) {
    return PDFHexString.of(toHex(await encryptData(key, object.asBytes())));
  }
  if (object instanceof PDFDict) {
    for (const [name, value] of object.entries()) {
      const replaced = await encryptStrings(value, key);
      if (replaced !== value) object.set(name, replaced);
    }
    return object;
  }
  if (object instanceof PDFArray) {
    for (let i = 0; i < object.size(); i++) {
      const value = object.get(i);
      const replaced = await encryptStrings(value, key);
      if (replaced !== value) object.set(i, replaced);
    }
    return object;
  }
  return object;
}

function isSignatureDict(dict: PDFDict): boolean {
  const type = dict.lookup(PDFName.of("Type"));
  return type === PDFName.of("Sig") || type === PDFName.of("DocTimeStamp");
}

export interface ProtectOptions {
  password: string;
}

export const MIN_PASSWORD_LENGTH = 6;

/** Encrypt a PDF with AES-256 so it needs the password to open. */
export async function protectPdf(
  file: { name: string; bytes: Uint8Array },
  { password }: ProtectOptions,
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ToolError(`Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  onProgress?.(0.02, "Reading PDF");
  const doc: PDFDocument = await loadPdf(file.bytes, file.name); // refuses files that are already encrypted
  const context = doc.context;

  onProgress?.(0.08, "Creating encryption keys");
  await nextFrame();
  // The owner password is the same as the opening password, so whoever knows it
  // can also remove the protection later in their PDF app.
  const security = await createSecurityValues(password, password);
  const key = await subtle().importKey("raw", buf(security.fileKey), { name: "AES-CBC" }, false, ["encrypt"]);

  const objects = context.enumerateIndirectObjects();
  for (let i = 0; i < objects.length; i++) {
    const [ref, object] = objects[i];
    if (i % 40 === 0) {
      onProgress?.(0.12 + (i / objects.length) * 0.75, `Encrypting ${i + 1} of ${objects.length} objects`);
      await nextFrame();
    }
    if (object instanceof PDFRawStream) {
      await encryptStrings(object.dict, key);
      const encrypted = await encryptData(key, object.contents);
      const dict = object.dict;
      dict.set(PDFName.of("Length"), PDFNumber.of(encrypted.length));
      context.assign(ref, PDFRawStream.of(dict, encrypted));
    } else if (object instanceof PDFStream) {
      // Streams pdf-lib created itself (e.g. new content); encode then encrypt.
      const contents = object.getContents();
      await encryptStrings(object.dict, key);
      const encrypted = await encryptData(key, contents);
      const dict = object.dict;
      dict.set(PDFName.of("Length"), PDFNumber.of(encrypted.length));
      context.assign(ref, PDFRawStream.of(dict, encrypted));
    } else if (object instanceof PDFDict && isSignatureDict(object)) {
      throw new ToolError("This PDF is digitally signed. Adding a password would invalidate the signature, so it can't be protected here.");
    } else {
      const replaced = await encryptStrings(object, key);
      if (replaced !== object) context.assign(ref, replaced); // a bare string stored as its own object
    }
  }

  // The encryption dictionary itself is never encrypted.
  const encryptDict = context.obj({
    Filter: "Standard",
    V: 5,
    R: 6,
    Length: 256,
    P: ALL_PERMISSIONS,
    EncryptMetadata: true,
    StmF: "StdCF",
    StrF: "StdCF",
    CF: { StdCF: { Type: "CryptFilter", CFM: "AESV3", AuthEvent: "DocOpen", Length: 32 } },
  });
  encryptDict.set(PDFName.of("O"), PDFHexString.of(toHex(security.O)));
  encryptDict.set(PDFName.of("U"), PDFHexString.of(toHex(security.U)));
  encryptDict.set(PDFName.of("OE"), PDFHexString.of(toHex(security.OE)));
  encryptDict.set(PDFName.of("UE"), PDFHexString.of(toHex(security.UE)));
  encryptDict.set(PDFName.of("Perms"), PDFHexString.of(toHex(security.Perms)));
  context.trailerInfo.Encrypt = context.register(encryptDict);
  const id = PDFHexString.of(toHex(random(16)));
  context.trailerInfo.ID = context.obj([id, id]);

  onProgress?.(0.9, "Saving protected PDF");
  await nextFrame();
  // Classic cross-reference table: object streams would hold unencrypted data.
  const bytes = await doc.save({ useObjectStreams: false, updateFieldAppearances: false, objectsPerTick: 50 });
  onProgress?.(1, "Done");
  return bytes;
}

/** Simple, honest password strength hint (not a security guarantee). */
export function passwordStrength(password: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (password.length < MIN_PASSWORD_LENGTH) return { score: 0, label: "Too short" };
  let variety = 0;
  if (/[a-z]/.test(password)) variety++;
  if (/[A-Z]/.test(password)) variety++;
  if (/\d/.test(password)) variety++;
  if (/[^A-Za-z0-9]/.test(password)) variety++;
  if (password.length >= 14 && variety >= 2) return { score: 3, label: "Strong" };
  if (password.length >= 10 && variety >= 2) return { score: 2, label: "Good" };
  return { score: 1, label: "Weak" };
}
