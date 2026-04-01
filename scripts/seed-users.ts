/**
 * Seed Users Script
 * 
 * Creates 3 users in Supabase Auth with their profiles:
 * - Amit Agarwal (Admin)
 * - Krati Saxena (BD Member)
 * - Yash Soni (BD Member)
 * 
 * Usage: npx tsx scripts/seed-users.ts
 * 
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_ROLE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Create admin client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface SeedUser {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'bd';
  bd_member_id: string | null;
  avatar_initials: string;
}

const USERS_TO_SEED: SeedUser[] = [
  {
    email: 'amit.agarwal@ciphercru.com',
    password: 'bdadmin@123',
    full_name: 'Amit Agarwal',
    role: 'admin',
    bd_member_id: null,
    avatar_initials: 'AA',
  },
  {
    email: 'krati.saxena@ciphercru.com',
    password: 'bduser@123',
    full_name: 'Krati Saxena',
    role: 'bd',
    bd_member_id: 'bd1',
    avatar_initials: 'KS',
  },
  {
    email: 'yash.soni@ciphercru.com',
    password: 'bduser@123',
    full_name: 'Yash Soni',
    role: 'bd',
    bd_member_id: 'bd2',
    avatar_initials: 'YS',
  },
];

async function seedUsers() {
  console.log('🌱 Starting user seeding...\n');

  for (const user of USERS_TO_SEED) {
    console.log(`Creating user: ${user.full_name} (${user.email})...`);

    // Create user in auth.users via Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: user.full_name,
        avatar_initials: user.avatar_initials,
        role: user.role,
      },
    });

    if (error) {
      console.error(`  ❌ Error creating ${user.email}: ${error.message}`);
      continue;
    }

    console.log(`  ✅ Auth user created: ${data.user.id}`);

    // Update profile with bd_member_id (trigger creates the initial profile)
    if (user.bd_member_id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ bd_member_id: user.bd_member_id })
        .eq('id', data.user.id);

      if (profileError) {
        console.error(`  ⚠️  Error updating profile for ${user.email}: ${profileError.message}`);
      } else {
        console.log(`  ✅ Profile updated with bd_member_id: ${user.bd_member_id}`);
      }
    }

    console.log('');
  }

  console.log('🎉 User seeding complete!');
}

seedUsers().catch(console.error);
