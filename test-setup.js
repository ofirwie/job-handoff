#!/usr/bin/env node

/**
 * Test script to verify the database setup is working
 * This will test basic connectivity and table existence
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://pjiqcpusjxfjuulojzhc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNzMzNzIsImV4cCI6MjA1MDg0OTM3Mn0.vEG15zFRNcUwfzDHGcgLIlx4Qs9DWrCPjxkFCJIbmhw';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Expected tables
const EXPECTED_TABLES = [
    'organizations',
    'plants', 
    'departments',
    'jobs',
    'user_profiles',
    'categories',
    'item_types',
    'base_templates',
    'templates',
    'template_items',
    'handovers',
    'handover_progress',
    'learning_insights',
    'audit_logs',
    'user_permissions'
];

async function testDatabaseSetup() {
    console.log('🧪 Testing Job Handoff Project Database Setup');
    console.log('='.repeat(50));
    console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
    console.log('');

    let allTestsPassed = true;
    let results = {
        connectionTest: false,
        tablesFound: 0,
        tablesExpected: EXPECTED_TABLES.length,
        dataTest: false,
        missingTables: []
    };

    // Test 1: Basic Connection
    console.log('1️⃣  Testing connection...');
    try {
        const { error } = await supabase.from('nonexistent_table').select('*').limit(1);
        
        if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
            console.log('   ✅ Connection successful');
            results.connectionTest = true;
        } else if (error && (error.message.includes('unauthorized') || error.message.includes('Invalid API key'))) {
            console.log('   ❌ Authentication failed');
            results.connectionTest = false;
        } else {
            console.log('   ✅ Connection successful');
            results.connectionTest = true;
        }
    } catch (error) {
        console.log(`   ❌ Connection failed: ${error.message}`);
        results.connectionTest = false;
    }

    if (!results.connectionTest) {
        console.log('\n❌ Cannot proceed without database connection');
        return results;
    }

    // Test 2: Check Tables Exist
    console.log('\n2️⃣  Checking for required tables...');
    for (const tableName of EXPECTED_TABLES) {
        try {
            const { error } = await supabase
                .from(tableName)
                .select('*')
                .limit(0);
            
            if (!error || error.code === 'PGRST116') { // PGRST116 = no rows, but table exists
                console.log(`   ✅ ${tableName}`);
                results.tablesFound++;
            } else {
                console.log(`   ❌ ${tableName} - ${error.message}`);
                results.missingTables.push(tableName);
            }
        } catch (error) {
            console.log(`   ❌ ${tableName} - ${error.message}`);
            results.missingTables.push(tableName);
        }
    }

    // Test 3: Check for Initial Data  
    console.log('\n3️⃣  Testing initial data...');
    try {
        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .limit(5);

        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
            .limit(5);

        if (!orgError && !catError && orgs?.length > 0 && categories?.length > 0) {
            console.log(`   ✅ Found ${orgs.length} organizations and ${categories.length} categories`);
            results.dataTest = true;
        } else {
            console.log(`   ⚠️  Limited data found - this may be normal for a fresh setup`);
            results.dataTest = false;
        }
    } catch (error) {
        console.log(`   ❌ Data test failed: ${error.message}`);
        results.dataTest = false;
    }

    // Results Summary
    console.log('\n📊 TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`Connection Test: ${results.connectionTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Tables Found: ${results.tablesFound}/${results.tablesExpected} ${results.tablesFound === results.tablesExpected ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Initial Data: ${results.dataTest ? '✅ PASS' : '⚠️  PARTIAL'}`);

    if (results.missingTables.length > 0) {
        console.log(`\n❌ Missing Tables: ${results.missingTables.join(', ')}`);
    }

    const overallSuccess = results.connectionTest && results.tablesFound === results.tablesExpected;
    
    if (overallSuccess) {
        console.log('\n🎉 DATABASE SETUP SUCCESSFUL!');
        console.log('Your job-handoff React app should now work properly.');
        console.log('\n🚀 Next steps:');
        console.log('   cd F:\\git\\job-handoff-project');
        console.log('   npm run dev');
        console.log('   Open http://localhost:5173 in your browser');
        allTestsPassed = true;
    } else {
        console.log('\n⚠️  DATABASE SETUP INCOMPLETE');
        console.log('Some tables are missing. Please:');
        console.log('1. Execute the SQL scripts in Supabase Dashboard');
        console.log('2. Check for any error messages during execution');
        console.log('3. Run this test again');
        allTestsPassed = false;
    }

    return results;
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
    testDatabaseSetup()
        .then(results => {
            process.exit(results.connectionTest && results.tablesFound === results.tablesExpected ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Test failed:', error.message);
            process.exit(1);
        });
}