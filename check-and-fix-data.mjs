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

async function checkAndFixData() {
  console.log('🔍 Checking existing data and filling gaps...\n');
  
  try {
    // Check organizations
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*');

    if (orgError) throw orgError;
    console.log(`📊 Organizations: ${orgs.length} found`);

    let orgId;
    if (orgs.length === 0) {
      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert({
          name: 'Albaad International',
          code: 'ALBAAD',
          settings: { industry: 'wet_wipes_hygiene', founded: 1985 }
        })
        .select()
        .single();
      
      if (createOrgError) throw createOrgError;
      orgId = newOrg.id;
      console.log('✅ Created organization');
    } else {
      orgId = orgs[0].id;
      console.log('✅ Using existing organization');
    }

    // Check plants
    const { data: plants, error: plantsError } = await supabase
      .from('plants')
      .select('*');

    if (plantsError) throw plantsError;
    console.log(`🏭 Plants: ${plants.length} found`);

    if (plants.length === 0) {
      const plantsToInsert = [
        {
          organization_id: orgId,
          name: 'Albaad USA',
          code: 'USA01',
          country: 'USA',
          location: 'United States Manufacturing Facility'
        },
        {
          organization_id: orgId,
          name: 'Albaad Germany',
          code: 'GER01',
          country: 'Germany',
          location: 'German R&D and Manufacturing'
        }
      ];

      const { data: newPlants, error: createPlantsError } = await supabase
        .from('plants')
        .insert(plantsToInsert)
        .select();

      if (createPlantsError) throw createPlantsError;
      console.log(`✅ Created ${newPlants.length} plants`);
      plants.push(...newPlants);
    }

    // Check departments
    const { data: depts, error: deptsError } = await supabase
      .from('departments')
      .select('*');

    if (deptsError) throw deptsError;
    console.log(`🏢 Departments: ${depts.length} found`);

    if (depts.length === 0) {
      const deptsToInsert = [];
      const deptNames = [
        { name: 'Production', code: 'PROD' },
        { name: 'Quality Assurance', code: 'QA' },
        { name: 'Human Resources', code: 'HR' }
      ];

      for (const plant of plants) {
        for (const dept of deptNames) {
          deptsToInsert.push({
            plant_id: plant.id,
            name: dept.name,
            code: dept.code
          });
        }
      }

      const { data: newDepts, error: createDeptsError } = await supabase
        .from('departments')
        .insert(deptsToInsert)
        .select();

      if (createDeptsError) throw createDeptsError;
      console.log(`✅ Created ${newDepts.length} departments`);
      depts.push(...newDepts);
    }

    // Check categories
    const { data: categories, error: catsError } = await supabase
      .from('categories')
      .select('*');

    if (catsError) throw catsError;
    console.log(`📁 Categories: ${categories.length} found`);

    if (categories.length === 0) {
      const catsToInsert = [
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
        }
      ];

      const { data: newCats, error: createCatsError } = await supabase
        .from('categories')
        .insert(catsToInsert)
        .select();

      if (createCatsError) throw createCatsError;
      console.log(`✅ Created ${newCats.length} categories`);
      categories.push(...newCats);
    }

    // Check jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*');

    if (jobsError) throw jobsError;
    console.log(`👔 Jobs: ${jobs.length} found`);

    if (jobs.length === 0 && depts.length > 0) {
      const jobsToInsert = [
        {
          department_id: depts[0].id,
          title: 'Production Manager',
          level: 'manager',
          description: 'Manages production operations and team'
        },
        {
          department_id: depts[1] ? depts[1].id : depts[0].id,
          title: 'Quality Engineer',
          level: 'senior',
          description: 'Ensures product quality and compliance'
        }
      ];

      const { data: newJobs, error: createJobsError } = await supabase
        .from('jobs')
        .insert(jobsToInsert)
        .select();

      if (createJobsError) throw createJobsError;
      console.log(`✅ Created ${newJobs.length} jobs`);
      jobs.push(...newJobs);
    }

    // Check templates
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('*');

    if (templatesError) throw templatesError;
    console.log(`📋 Templates: ${templates.length} found`);

    if (templates.length === 0 && jobs.length > 0) {
      const templateToInsert = {
        job_id: jobs[0].id,
        name: 'Standard Handover Template',
        description: 'Basic handover template for all roles',
        status: 'active',
        confidence_score: 0.7,
        generation_strategy: 'use_existing'
      };

      const { data: newTemplate, error: createTemplateError } = await supabase
        .from('templates')
        .insert(templateToInsert)
        .select()
        .single();

      if (createTemplateError) throw createTemplateError;
      console.log('✅ Created template');

      // Create template items
      if (categories.length > 0) {
        const templateItems = [
          {
            template_id: newTemplate.id,
            category_id: categories.find(c => c.name === 'files_and_documents')?.id || categories[0].id,
            title: 'Important Documents',
            description: 'All relevant documentation for the role',
            priority: 8,
            estimated_minutes: 45,
            is_mandatory: true,
            sort_order: 1
          },
          {
            template_id: newTemplate.id,
            category_id: categories.find(c => c.name === 'contacts_and_relationships')?.id || categories[0].id,
            title: 'Key Contacts',
            description: 'Important contacts and relationships',
            priority: 9,
            estimated_minutes: 30,
            is_mandatory: true,
            sort_order: 2
          }
        ];

        const { error: itemsError } = await supabase
          .from('template_items')
          .insert(templateItems);

        if (itemsError) throw itemsError;
        console.log('✅ Created template items');
      }

      templates.push(newTemplate);
    }

    // Check handovers
    const { data: handovers, error: handoversError } = await supabase
      .from('handovers')
      .select('*');

    if (handoversError) throw handoversError;
    console.log(`🤝 Handovers: ${handovers.length} found`);

    if (handovers.length === 0 && templates.length > 0 && jobs.length > 0) {
      const handoverToInsert = {
        template_id: templates[0].id,
        job_id: jobs[0].id,
        leaving_employee_name: 'John Smith',
        leaving_employee_email: 'john.smith@albaad.com',
        incoming_employee_name: 'Sarah Johnson',
        incoming_employee_email: 'sarah.johnson@albaad.com',
        manager_name: 'Mike Wilson',
        manager_email: 'mike.wilson@albaad.com',
        start_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'in_progress',
        notes: 'Sample handover for testing'
      };

      const { data: newHandover, error: createHandoverError } = await supabase
        .from('handovers')
        .insert(handoverToInsert)
        .select()
        .single();

      if (createHandoverError) throw createHandoverError;
      console.log('✅ Created sample handover');
    }

    console.log('\n🎉 Database check and fix completed!');
    console.log('\n📊 Final Summary:');
    console.log(`- Organizations: ${orgs.length > 0 ? orgs.length : 1}`);
    console.log(`- Plants: ${plants.length}`);
    console.log(`- Departments: ${depts.length}`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Jobs: ${jobs.length}`);
    console.log(`- Templates: ${templates.length}`);
    console.log(`- Handovers: ${handovers.length}`);

    // Test the main query that the app uses
    console.log('\n🧪 Testing main app query...');
    const { data: testQuery, error: testError } = await supabase
      .from('handovers')
      .select(`
        *,
        template:templates(
          *,
          job:jobs(
            *,
            department:departments(
              *,
              plant:plants(
                *,
                organization:organizations(*)
              )
            )
          )
        )
      `)
      .limit(1);

    if (testError) {
      console.log('❌ Main query failed:', testError.message);
    } else {
      console.log(`✅ Main query works! Found ${testQuery.length} handovers with full data`);
    }

  } catch (error) {
    console.error('\n❌ Error during check and fix:', error.message);
    console.error('Full error:', error);
  }
}

// Run the check and fix
checkAndFixData();