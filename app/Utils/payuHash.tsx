// payuHash.ts
import sha512 from 'crypto-js/sha512';

interface PayUHashData {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

/**
 * Generates a hash for PayU payment gateway verification
 * Hash formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export const generateHash = (data: PayUHashData, merchantKey: string, merchantSalt: string): string => {
  // Ensure all optional fields are handled
  const udf1 = data.udf1 || '';
  const udf2 = data.udf2 || '';
  const udf3 = data.udf3 || '';
  const udf4 = data.udf4 || '';
  const udf5 = data.udf5 || '';

  // Create the hash string according to PayU's specification
  const hashString = [
    merchantKey,               // key
    data.txnid,               // txnid
    data.amount,              // amount
    data.productinfo,         // productinfo
    data.firstname,           // firstname
    data.email,               // email
    udf1,                     // udf1
    udf2,                     // udf2
    udf3,                     // udf3
    udf4,                     // udf4
    udf5,                     // udf5
    '',                       // empty string
    '',                       // empty string
    '',                       // empty string
    '',                       // empty string
    '',                       // empty string
    merchantSalt              // SALT
  ].join('|');

  // Generate and return the SHA-512 hash
  return sha512(hashString).toString();
};