import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key missing in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    try {
        console.log('Fetching tables and sample data...');

        // 1. Products
        const { data: products, error: prodErr } = await supabase.from('products').select('*').limit(1);
        if (prodErr) {
            console.error('Error fetching products:', prodErr.message);
        } else {
            console.log('✓ Products table exists. Sample:', products);
        }

        // 2. Customers
        const { data: customers, error: custErr } = await supabase.from('customers').select('*').limit(1);
        if (custErr) {
            console.error('Error fetching customers:', custErr.message);
        } else {
            console.log('✓ Customers table exists. Columns in sample:', customers[0] ? Object.keys(customers[0]) : 'Empty table');
        }

        // 3. Orders
        const { data: orders, error: ordErr } = await supabase.from('orders').select('*').limit(1);
        if (ordErr) {
            console.error('Error fetching orders:', ordErr.message);
        } else {
            console.log('✓ Orders table exists. Columns in sample:', orders[0] ? Object.keys(orders[0]) : 'Empty table');
        }

        // 4. Invoices
        const { data: invoices, error: invErr } = await supabase.from('invoices').select('*').limit(1);
        if (invErr) {
            console.error('Error fetching invoices:', invErr.message);
        } else {
            console.log('✓ Invoices table exists. Columns in sample:', invoices[0] ? Object.keys(invoices[0]) : 'Empty table');
        }

        // 5. Reviews
        const { data: reviews, error: revErr } = await supabase.from('reviews').select('*').limit(1);
        if (revErr) {
            console.error('Error fetching reviews:', revErr.message);
        } else {
            console.log('✓ Reviews table exists. Columns in sample:', reviews[0] ? Object.keys(reviews[0]) : 'Empty table');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

checkSchema();
