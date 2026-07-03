// HexAI Payment Gateway Service
// All payments go through the HexAI gateway — not directly to Wave, APS, or any bank.
// This service is payment-method agnostic. The gateway handles Wave, APS, bank, etc.
// API key is server-side only — never exposed to frontend.

const fetch = require('node-fetch');

const BASE_URL = process.env.HEXAI_API_BASE_URL;
console.log('HEXAI BASE_URL IS:', BASE_URL);
const API_KEY  = process.env.HEXAI_API_KEY;

const headers = () => ({
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'x-hexai-key':   API_KEY,
});

function withQueryParam(url, key, value) {
  const u = new URL(url);
  u.searchParams.set(key, value);
  return u.toString();
}

/**
 * Builds the payment reference string embedded in every transaction.
 * Format: OSUSU-{groupId}-{cycleId}-{userId}-{timestamp}
 */
function buildReference(groupId, cycleId, userId) {
  const ts = Math.floor(Date.now() / 1000);
  return `OSUSU-${groupId}-${cycleId}-${userId}-${ts}`;
}

/**
 * Parses a payment reference back into its components.
 * Returns null if format is invalid.
 */
function parseReference(reference) {
  if (!reference || !reference.startsWith('OSUSU-')) return null;

  const parts = reference.split('-');
  if (parts.length < 5) return null;

  return {
    groupId:   parts[1],
    cycleId:   parts[2],
    userId:    parts[3],
    timestamp: parseInt(parts[4]),
  };
}

/**
 * Initiates a payment collection via the HexAI gateway.
 * Returns the checkout URL to redirect the customer to.
 */
async function initiatePayment({ amount, reference, successUrl, errorUrl, customerPhone }) {
  const body = {
    amount:           parseFloat(amount).toFixed(2),
    currency:         'GMD',
    client_reference: reference,
customer_name:    'Osusu Member',
    success_url:      '',
    error_url:        '',
  };

  if (customerPhone && /^\+220[0-9]{7}$/.test(customerPhone)) {
    body.customer_mobile = customerPhone;
  }
const response = await fetch(`${BASE_URL}/collections/initiate`, {
  method:  'POST',
  headers: headers(),
  body:    JSON.stringify(body),
});

const rawText = await response.text();
console.log('HEXAI RAW RESPONSE:', response.status, rawText);

let data;
try {
  data = JSON.parse(rawText);
} catch {
  throw new Error(`HexAI returned non-JSON response (status ${response.status}): ${rawText.slice(0, 200)}`);
}
  

  if (!response.ok || data.status !== 'success') {
    const err = new Error(data.message || 'Payment initiation failed');
    err.code = data.error?.code || 'PAYMENT_FAILED';
    err.statusCode = response.status;
    throw err;
  }

  return data.data; // { transaction_id, redirect_url, status }
}

/**
 * Checks the status of a payment by reference.
 */
async function getPaymentStatus(reference) {
  const response = await fetch(`${BASE_URL}/collections/status/${reference}`, {
    method:  'GET',
    headers: headers(),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error('Failed to fetch payment status');
    err.statusCode = response.status;
    throw err;
  }

  return data.data;
}

module.exports = { initiatePayment, getPaymentStatus, buildReference, parseReference };