import { createClient } from '@supabase/supabase-js';

// Supabase configuration with service role key for admin operations
const supabaseUrl = 'https://pjiqcpusjxfjuulojzhc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzI0MiwiZXhwIjoyMDY5Mzk5MjQyfQ.hH8KZ9S6eJSUoUU4LbWefyeaO9Vr5HyQk8_TK-rfbMY';

// Create Supabase client with service role for bypassing RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function insertInitialData() {
  console.log('🚀 Starting initial data insertion for Job Handoff System...');
  
  try {
    // Step 1: Insert Albaad organization
    console.log('\n📊 Creating Albaad organization...');
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .upsert({
        name: 'Albaad International',
        code: 'ALBAAD',
        settings: {
          industry: 'wet_wipes_hygiene',
          founded: 1985,
          headquarters: 'Israel',
          products: ['wet_wipes', 'feminine_hygiene']
        }
      })
      .select()
      .single();

    if (orgError) throw orgError;
    console.log('✅ Organization created:', orgData.name);

    // Step 2: Insert plants
    console.log('\n🏭 Creating plants...');
    const plants = [
      {
        organization_id: orgData.id,
        name: 'Albaad USA',
        code: 'USA01',
        country: 'USA',
        location: 'United States Manufacturing Facility',
        local_regulations: { fda_compliance: true, osha_requirements: true },
        cultural_settings: { language: 'en', date_format: 'MM/DD/YYYY', currency: 'USD' }
      },
      {
        organization_id: orgData.id,
        name: 'Albaad Poland',
        code: 'POL01',
        country: 'Poland',
        location: 'Polish Production Center',
        local_regulations: { eu_regulations: true, gdpr_compliance: true },
        cultural_settings: { language: 'pl', date_format: 'DD/MM/YYYY', currency: 'EUR' }
      },
      {
        organization_id: orgData.id,
        name: 'Albaad Germany',
        code: 'GER01',
        country: 'Germany',
        location: 'German R&D and Manufacturing',
        local_regulations: { eu_regulations: true, gdpr_compliance: true, din_standards: true },
        cultural_settings: { language: 'de', date_format: 'DD.MM.YYYY', currency: 'EUR' }
      },
      {
        organization_id: orgData.id,
        name: 'Albaad Spain',
        code: 'ESP01',
        country: 'Spain',
        location: 'Spanish Production Facility',
        local_regulations: { eu_regulations: true, gdpr_compliance: true },
        cultural_settings: { language: 'es', date_format: 'DD/MM/YYYY', currency: 'EUR' }
      },
      {
        organization_id: orgData.id,
        name: 'Albaad Israel HQ',
        code: 'ISR01',
        country: 'Israel',
        location: 'Headquarters and R&D Center',
        local_regulations: { israeli_standards: true, kosher_certification: true },
        cultural_settings: { language: 'he', date_format: 'DD/MM/YYYY', currency: 'ILS' }
      }
    ];

    const { data: plantsData, error: plantsError } = await supabase
      .from('plants')
      .upsert(plants)
      .select();

    if (plantsError) throw plantsError;
    console.log(`✅ Created ${plantsData.length} plants`);

    // Step 3: Insert departments for each plant
    console.log('\n🏢 Creating departments...');
    const departments = [];
    const deptNames = [
      { name: 'Production', code: 'PROD' },
      { name: 'Quality Assurance', code: 'QA' },
      { name: 'Research & Development', code: 'RD' },
      { name: 'Engineering', code: 'ENG' },
      { name: 'Supply Chain', code: 'SCM' },
      { name: 'Human Resources', code: 'HR' },
      { name: 'Finance', code: 'FIN' },
      { name: 'Sales & Marketing', code: 'SALES' },
      { name: 'Maintenance', code: 'MAINT' },
      { name: 'Environmental & Safety', code: 'EHS' }
    ];

    for (const plant of plantsData) {
      for (const dept of deptNames) {
        departments.push({
          plant_id: plant.id,
          name: dept.name,
          code: dept.code
        });
      }
    }

    const { data: deptsData, error: deptsError } = await supabase
      .from('departments')
      .upsert(departments)
      .select();

    if (deptsError) throw deptsError;
    console.log(`✅ Created ${deptsData.length} departments`);

    // Step 4: Insert core categories
    console.log('\n📁 Creating categories...');
    const categories = [
      {
        name: 'files_and_documents',
        display_name: 'Files & Documents',
        description: 'All files, documents, and digital assets',
        is_system_default: true
      },
      {
        name: 'processes_and_procedures',
        display_name: 'Processes & Procedures',
        description: 'Standard operating procedures and workflows',
        is_system_default: true
      },
      {
        name: 'contacts_and_relationships',
        display_name: 'Contacts & Relationships',
        description: 'Key contacts, stakeholders, and business relationships',
        is_system_default: true
      },
      {
        name: 'systems_and_access',
        display_name: 'Systems & Access',
        description: 'IT systems, software, and access credentials',
        is_system_default: true
      },
      {
        name: 'knowledge_and_insights',
        display_name: 'Knowledge & Insights',
        description: 'Institutional knowledge and experience insights',
        is_system_default: true
      },
      {
        name: 'regulatory_compliance',
        display_name: 'Regulatory Compliance',
        description: 'Regulatory requirements and compliance procedures',
        industry_specific: true
      },
      {
        name: 'manufacturing_operations',
        display_name: 'Manufacturing Operations',
        description: 'Production line operations and manufacturing processes',
        industry_specific: true
      }
    ];

    const { data: catsData, error: catsError } = await supabase
      .from('categories')
      .upsert(categories)
      .select();

    if (catsError) throw catsError;
    console.log(`✅ Created ${catsData.length} categories`);

    // Step 5: Create sample jobs
    console.log('\n👔 Creating sample jobs...');
    const sampleJobs = [];
    
    // Get some departments to create jobs for
    const prodDept = deptsData.find(d => d.code === 'PROD');
    const qaDept = deptsData.find(d => d.code === 'QA');
    const hrDept = deptsData.find(d => d.code === 'HR');

    if (prodDept) {
      sampleJobs.push({
        department_id: prodDept.id,
        title: 'Production Manager',
        level: 'manager',
        description: 'Manages production operations and team'
      });
    }

    if (qaDept) {
      sampleJobs.push({
        department_id: qaDept.id,
        title: 'Quality Engineer',
        level: 'senior',
        description: 'Ensures product quality and compliance'
      });
    }

    if (hrDept) {
      sampleJobs.push({
        department_id: hrDept.id,
        title: 'HR Business Partner',
        level: 'senior',
        description: 'Partners with business units on HR strategy'
      });
    }

    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .upsert(sampleJobs)
      .select();

    if (jobsError) throw jobsError;
    console.log(`✅ Created ${jobsData.length} jobs`);

    // Step 6: Create a sample template and handover
    if (jobsData.length > 0) {
      console.log('\n📋 Creating sample template...');
      const sampleTemplate = {
        job_id: jobsData[0].id,
        name: 'Production Manager Handover Template',
        description: 'Standard handover template for production management roles',
        status: 'active',
        confidence_score: 0.8,
        generation_strategy: 'use_existing'
      };

      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .upsert(sampleTemplate)
        .select()
        .single();

      if (templateError) throw templateError;
      console.log('✅ Created sample template');

      // Create template items
      const templateItems = [
        {
          template_id: templateData.id,
          category_id: catsData.find(c => c.name === 'files_and_documents')?.id,
          title: 'Production Reports and Documentation',
          description: 'All production reports, schedules, and documentation',
          priority: 9,
          estimated_minutes: 60,
          is_mandatory: true,
          sort_order: 1
        },
        {
          template_id: templateData.id,
          category_id: catsData.find(c => c.name === 'contacts_and_relationships')?.id,
          title: 'Key Production Contacts',
          description: 'Suppliers, vendors, and internal stakeholders',
          priority: 8,
          estimated_minutes: 30,
          is_mandatory: true,
          sort_order: 2
        },
        {
          template_id: templateData.id,
          category_id: catsData.find(c => c.name === 'manufacturing_operations')?.id,
          title: 'Production Line Procedures',
          description: 'Operating procedures for production lines',
          priority: 10,
          estimated_minutes: 90,
          is_mandatory: true,
          sort_order: 3
        }
      ];

      const { data: itemsData, error: itemsError } = await supabase
        .from('template_items')
        .upsert(templateItems)
        .select();

      if (itemsError) throw itemsError;
      console.log(`✅ Created ${itemsData.length} template items`);

      // Create a sample handover
      console.log('\n🤝 Creating sample handover...');
      const sampleHandover = {
        template_id: templateData.id,
        job_id: jobsData[0].id,
        leaving_employee_name: 'John Smith',
        leaving_employee_email: 'john.smith@albaad.com',
        incoming_employee_name: 'Sarah Johnson',
        incoming_employee_email: 'sarah.johnson@albaad.com',
        manager_name: 'Mike Wilson',
        manager_email: 'mike.wilson@albaad.com',
        start_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        status: 'in_progress',
        notes: 'Sample handover for testing the system'
      };

      const { data: handoverData, error: handoverError } = await supabase
        .from('handovers')
        .upsert(sampleHandover)
        .select()
        .single();

      if (handoverError) throw handoverError;
      console.log('✅ Created sample handover');

      // Create progress entries for the handover
      const progressEntries = itemsData.map((item, index) => ({
        handover_id: handoverData.id,
        template_item_id: item.id,
        status: index === 0 ? 'completed' : 'pending',
        completed_at: index === 0 ? new Date().toISOString() : null
      }));

      const { error: progressError } = await supabase
        .from('handover_progress')
        .upsert(progressEntries);

      if (progressError) throw progressError;
      console.log(`✅ Created ${progressEntries.length} progress entries`);
    }

    console.log('\n🎉 Initial data insertion completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- 1 organization (Albaad International)`);
    console.log(`- ${plantsData.length} plants across 5 countries`);
    console.log(`- ${deptsData.length} departments`);
    console.log(`- ${catsData.length} categories`);
    console.log(`- ${jobsData.length} sample jobs`);
    console.log(`- 1 sample template with items`);
    console.log(`- 1 sample handover with progress tracking`);
    
    console.log('\n✨ Your Job Handoff app should now display data instead of a white screen!');

  } catch (error) {
    console.error('\n❌ Error inserting initial data:', error.message);
    console.error('Full error:', error);
  }
}

// Run the insertion
insertInitialData();