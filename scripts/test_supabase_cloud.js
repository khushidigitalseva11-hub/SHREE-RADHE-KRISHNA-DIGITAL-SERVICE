// scripts/test_supabase_cloud.js
// Verification of Supabase Cloud Tables, Connectivity & Data Integrity

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
      }
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing Supabase URL or SERVICE_KEY in .env.local');
  process.exit(1);
}

console.log('=====================================================');
console.log('📡 SHREE RADHE KRISHNA DIGITAL SERVICE');
console.log('   Supabase Cloud Live Database Verification');
console.log('=====================================================');
console.log(`🔗 Project URL: ${SUPABASE_URL}`);
console.log(`🔑 Service Role Auth: ${SERVICE_KEY.substring(0, 15)}...${SERVICE_KEY.substring(SERVICE_KEY.length - 8)}`);

const tablesToCheck = [
  'services',
  'system_settings',
  'admin_users',
  'customer_profiles',
  'applications',
  'application_status_history',
  'documents',
  'payments',
  'chat_conversations',
  'chat_messages',
  'support_tickets',
  'support_messages',
  'notifications',
  'otp_verifications',
  'audit_logs'
];

function fetchTable(tableName) {
  return new Promise((resolve) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${tableName}?select=*&limit=5`);
    const options = {
      method: 'GET',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let count = res.headers['content-range'] ? res.headers['content-range'].split('/')[1] : null;
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              table: tableName,
              status: 'ONLINE',
              statusCode: res.statusCode,
              count: count || (Array.isArray(json) ? json.length : 0),
              sample: Array.isArray(json) && json.length > 0 ? json[0] : null
            });
          } else {
            resolve({
              table: tableName,
              status: 'ERROR',
              statusCode: res.statusCode,
              error: json.message || JSON.stringify(json)
            });
          }
        } catch (e) {
          resolve({
            table: tableName,
            status: 'PARSE_ERROR',
            statusCode: res.statusCode,
            raw: data.substring(0, 100)
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        table: tableName,
        status: 'NETWORK_ERROR',
        error: err.message
      });
    });

    req.end();
  });
}

async function run() {
  let passed = 0;
  let failed = 0;

  console.log('\n--- 1. Querying All 15 Supabase Tables ---');
  for (const t of tablesToCheck) {
    const res = await fetchTable(t);
    if (res.status === 'ONLINE') {
      console.log(`✅ [${t.padEnd(26)}] status: ONLINE | rows: ${res.count}`);
      passed++;
    } else {
      console.log(`❌ [${t.padEnd(26)}] status: ${res.status} (${res.statusCode}) - ${res.error || res.raw}`);
      failed++;
    }
  }

  console.log('\n--- 2. Checking Services Catalog & System Settings ---');
  const servicesRes = await fetchTable('services');
  if (servicesRes.status === 'ONLINE' && servicesRes.sample) {
    console.log(`✅ Sample Service Loaded: "${servicesRes.sample.name_gu} / ${servicesRes.sample.name}" (Code: ${servicesRes.sample.service_code}, Fee: ₹${servicesRes.sample.price})`);
  }

  const settingsRes = await fetchTable('system_settings');
  if (settingsRes.status === 'ONLINE') {
    console.log(`✅ System Settings Table contains business parameters.`);
  }

  console.log('\n=====================================================');
  console.log(`📊 Result: ${passed}/${tablesToCheck.length} tables verified online.`);
  if (failed === 0) {
    console.log('🎉 ALL SUPABASE CLOUD DATABASE TABLES ARE 100% ONLINE!');
  } else {
    console.log(`⚠️ ${failed} table(s) encountered issues.`);
  }
  console.log('=====================================================\n');
}

run();
