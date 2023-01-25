const Int64BE = require("int64-buffer").Int64BE;
const axios = require("axios");
const CryptoJS = require("crypto-js");
const sha256 = require("sha256");
const bech32 = require("bech32").bech32;
const bip39 = require("bip39");
const pbkdf2 = require("pbkdf2");
const sodium = require("libsodium-wrappers");
const api_node = "https://mainnet.umi.top";

interface Keys {
  privateKey: Uint8Array | Array<number>;
  publicKey: Uint8Array | Array<number>;
}

interface WalletData {
  mnemonic: string;
  keys: Keys;
  address: string;
}

async function getUmiBalance(address: string): Promise<number> {
  try {
    let response = await axios.get(
      `${api_node}/api/addresses/${address}/account`
    );
    if (response.data && response.data.data) {
      return response.data.data.confirmedBalance / 100;
    }
  } catch (error) {
    console.log("node get balance error: ", error);
  }
  return 0;
}

async function getUmiTransactions(
  address: string,
  limit: number = 10,
  offset: number = 0
): Promise<object> {
  try {
    let response = await axios.get(
      `${api_node}/api/addresses/${address}/transactions?limit=${limit}&offset=${offset}`
    );
    return response.data.data;
  } catch (error) {
    console.log("node get transactions error: ", error);
  }
  return {};
}

async function sendUmiTransaction(
  transactionData: string
): Promise<object> | null {
  console.log(typeof transactionData);
  try {
    let response = await axios.post(`${api_node}/api/mempool`, {
      data: transactionData.toString(),
    });
    return response.data.data;
  } catch (error) {
    console.log("error while sending transactions: ", error);
    return null;
  }
}

async function generateWallet(prefix: string): Promise<WalletData> {
  return restoreWallet(bip39.generateMnemonic(256), prefix);
}

async function restoreWallet(mnemonic: string, prefix: string): Promise<WalletData> {
  let keys = await generateKeys(mnemonic);
  let address = getUmiAdress(keys.publicKey, prefix);
  return { mnemonic, keys, address };
}

function getUmiAdress(publicKey: Uint8Array | Array<number>, prefix: string): string {
  let words = bech32.toWords(Buffer.from(publicKey));
  return bech32.encode(prefix, words);
}

async function generateKeys(mnemonic: string): Promise<Keys> {
  await sodium.ready;
  return sodium.crypto_sign_seed_keypair(
    hexStringToInt(
      sha256(pbkdf2.pbkdf2Sync(mnemonic, "mnemonic", 2048, 64, "sha512"), true)
    )
  );
}

async function send(
  _privateKey: Array<number>,
  _publicKey: Array<number>,
  toAddress: string,
  amount: number,
  prefix: string,
): Promise<boolean | object> {
  let privateKey = Uint8Array.from(_privateKey);
  let publicKey = Uint8Array.from(_publicKey);
  let toPublicKey = Uint8Array.from(
    bech32.fromWords(bech32.decode(toAddress).words)
  );
  try {
    let trx = new Uint8Array(150);
    setVersion(trx, 8);

    let prefix_binary = uint16ToBytes(prefixToVersion(prefix));
    let from_address = new Uint8Array([...prefix_binary, ...publicKey]);
    setSender(trx, from_address);

    let to_address = new Uint8Array([...prefix_binary, ...toPublicKey]);
    setRecepient(trx, to_address);

    setValue(trx, amount);
    await signTransaction(trx, privateKey);
    let trx64 = Buffer.from(trx).toString("base64");

    let result = await sendUmiTransaction(trx64);

    if (result) {
      console.log(`send ${prefix} result - ${result}`);
      return result;
    } else {
      console.log(`error send ${prefix} result - ${result}`);
      return false;
    }
  } catch (error) {
    console.log(`error send ${prefix} error - ${error}`);
    return false;
  }
}

async function signMessage(
  message: string | Uint8Array,
  key: Uint8Array | Array<number>
): Promise<Uint8Array> {
  await sodium.ready;
  let res = sodium.crypto_sign_detached(message, Uint8Array.from(key));
  return sodium.crypto_sign_detached(message, Uint8Array.from(key));
}

function setVersion(trx: Uint8Array, version: number) {
  trx[0] = version;
}

function setSender(trx: Uint8Array, address: Uint8Array) {
  trx.set(address, 1);
}

function setRecepient(trx: Uint8Array, address: Uint8Array) {
  trx.set(address, 35);
}

function setValue(trx: Uint8Array, value: number) {
  trx.set(new Int64BE(value).buffer, 69);
}

async function signTransaction(trx: Uint8Array, privateKey: Uint8Array) {
  setNonce(trx);
  let signature = await signMessage(trx.subarray(0, 86), privateKey);
  trx.set(signature, 86);
}

function setNonce(trx: Uint8Array) {
  let time = Math.round(Date.now() / 1000);
  let time_bytes = uint32ToBytes(time);
  trx.set(time_bytes, 77);

  trx.set(uint32ToBytes(Math.random() * 9999), 81);
}

function prefixToVersion(prefix: string): number {
  if (prefix === "genesis") return 0;
  if (prefix.length !== 3) return null;
  const ch1 = prefix.charCodeAt(0) - 96;
  const ch2 = prefix.charCodeAt(1) - 96;
  const ch3 = prefix.charCodeAt(2) - 96;
  return (ch1 << 10) + (ch2 << 5) + ch3;
}

function uint16ToBytes(value: number): Uint8Array {
  let bytes = new Uint8Array(2);
  bytes[0] = (value >> 8) & 0xff;
  bytes[1] = value & 0xff;
  return bytes;
}

function uint32ToBytes(value: number): Uint8Array {
  return Uint8Array.of(
    (value & 0xff000000) >> 24,
    (value & 0x00ff0000) >> 16,
    (value & 0x0000ff00) >> 8,
    (value & 0x000000ff) >> 0
  );
}

function hexStringToInt(string_data: string): Uint8Array {
  let unsignedIntegers = string_data.match(/[\dA-F]{2}/gi).map(function (s) {
    return parseInt(s, 16);
  });
  return new Uint8Array(unsignedIntegers);
}

export default {
  getUmiBalance,
  generateWallet,
  send,
  signMessage,
  restoreWallet,
  getUmiTransactions,
};
