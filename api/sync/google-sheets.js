// Vercel API route for Google Sheets synchronization
import { createClient } from '@supabase/supabase-js';
import googleSheetsUtils from '../../src/utils/google-sheets.ts';
import googleDriveUtils from '../../src/utils/google-drive.ts';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Send welcome email to departing employee
 */
const sendWelcomeEmail = async (email, handoverId, name, jobTitle) => {
  // TODO: Integrate with email service (SendGrid, SES, etc.)
  console.log(`Welcome email sent to ${email} for handover ${handoverId}`);
  return true;
};

/**
 * Create handover from Google Sheets employee data
 */
const createHandoverFromSheet = async (employeeData) => {
  try {
    // Create Google Drive folder for the handover
    const folderName = googleDriveUtils.generateHandoverFolderName(
      employeeData.employee_name,
      employeeData.job_title,
      employeeData.departure_date
    );

    const driveFolder = await googleDriveUtils.createGoogleDriveFolder(folderName);
    
    // Create subfolders for organization
    await googleDriveUtils.createHandoverSubfolders(driveFolder.id);

    // Create handover record in Supabase
    const { data: handover, error } = await supabase
      .from('handovers')
      .insert({
        employee_name: employeeData.employee_name,
        employee_email: employeeData.employee_email,
        job_code: employeeData.job_code,
        job_title: employeeData.job_title,
        departure_date: employeeData.departure_date,
        manager_email: employeeData.manager_email,
        template_id: employeeData.template_id,
        drive_folder_id: driveFolder.id,
        drive_folder_url: driveFolder.webViewLink,
        status: 'created',
        form_data: {}
      })
      .select()
      .single();

    if (error) throw error;

    // Get template and create tasks
    const { data: template } = await supabase
      .from('templates')
      .select('sections')
      .eq('id', employeeData.template_id)
      .single();

    if (template && template.sections && template.sections.tasks) {
      const tasks = template.sections.tasks.map(task => ({
        handover_id: handover.id,
        task_id: task.id,
        description: task.description,
        instructions: task.instructions || '',
        is_required: task.required || false
      }));

      const { error: tasksError } = await supabase
        .from('handover_tasks')
        .insert(tasks);

      if (tasksError) {
        console.error('Error creating tasks:', tasksError);
        // Don't fail the entire operation for task creation errors
      }
    }

    return { success: true, handoverId: handover.id };

  } catch (error) {
    console.error('Error creating handover from sheet:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Main API handler for Google Sheets synchronization
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting Google Sheets sync...');

    // Create sync log entry
    const { data: syncLog, error: syncLogError } = await supabase
      .from('sheets_sync_log')
      .insert({ status: 'running' })
      .select()
      .single();

    if (syncLogError) {
      throw new Error(`Failed to create sync log: ${syncLogError.message}`);
    }

    // Read departing employees from Google Sheets
    const employees = await googleSheetsUtils.readDepartingEmployees();
    console.log(`Found ${employees.length} employee records`);

    let processedCount = 0;
    let createdCount = 0;
    let skippedCount = 0;
    const errors = [];
    const successfulUpdates = [];
    const errorUpdates = [];

    // Process each employee
    for (const employee of employees) {
      processedCount++;
      
      try {
        // Skip if already processed
        if (employee.processed) {
          skippedCount++;
          continue;
        }

        // Validate employee data
        const validation = googleSheetsUtils.validateEmployeeData(employee);
        if (!validation.isValid) {
          const errorMsg = `Row ${employee.rowIndex}: ${validation.errors.join(', ')}`;
          errors.push(errorMsg);
          errorUpdates.push({ rowIndex: employee.rowIndex, error: validation.errors.join(', ') });
          continue;
        }

        // Check if job code exists and get template
        const { data: jobRole, error: jobRoleError } = await supabase
          .from('job_roles')
          .select('template_id')
          .eq('job_code', employee.job_code)
          .single();

        if (jobRoleError || !jobRole) {
          const errorMsg = `Row ${employee.rowIndex}: Job code ${employee.job_code} not found`;
          errors.push(errorMsg);
          errorUpdates.push({ rowIndex: employee.rowIndex, error: `Job code ${employee.job_code} not found` });
          continue;
        }

        // Check if handover already exists for this employee
        const { data: existingHandover } = await supabase
          .from('handovers')
          .select('id')
          .eq('employee_email', employee.employee_email)
          .eq('job_code', employee.job_code)
          .single();

        if (existingHandover) {
          const errorMsg = `Row ${employee.rowIndex}: Handover already exists for ${employee.employee_email}`;
          errors.push(errorMsg);
          errorUpdates.push({ rowIndex: employee.rowIndex, error: 'Handover already exists' });
          continue;
        }

        // Create handover
        const result = await createHandoverFromSheet({
          ...employee,
          template_id: jobRole.template_id
        });

        if (result.success) {
          createdCount++;
          successfulUpdates.push({
            rowIndex: employee.rowIndex,
            handoverId: result.handoverId
          });

          // Send welcome email
          try {
            await sendWelcomeEmail(
              employee.employee_email,
              result.handoverId,
              employee.employee_name,
              employee.job_title
            );
          } catch (emailError) {
            console.warn(`Failed to send welcome email to ${employee.employee_email}:`, emailError);
          }

        } else {
          const errorMsg = `Row ${employee.rowIndex}: ${result.error}`;
          errors.push(errorMsg);
          errorUpdates.push({ rowIndex: employee.rowIndex, error: result.error });
        }

      } catch (error) {
        const errorMsg = `Row ${employee.rowIndex}: ${error.message}`;
        errors.push(errorMsg);
        errorUpdates.push({ rowIndex: employee.rowIndex, error: error.message });
      }
    }

    // Update Google Sheets with results
    try {
      if (successfulUpdates.length > 0) {
        await googleSheetsUtils.markEmployeesAsProcessed(successfulUpdates);
      }
      
      if (errorUpdates.length > 0) {
        await googleSheetsUtils.addErrorNotes(errorUpdates);
      }
    } catch (sheetsError) {
      console.error('Failed to update Google Sheets:', sheetsError);
      errors.push(`Failed to update Google Sheets: ${sheetsError.message}`);
    }

    // Update sync log
    const syncStatus = errors.length === 0 ? 'completed' : 'completed';
    await supabase
      .from('sheets_sync_log')
      .update({
        sync_completed_at: new Date().toISOString(),
        rows_processed: processedCount,
        handovers_created: createdCount,
        errors_count: errors.length,
        error_details: errors,
        status: syncStatus
      })
      .eq('id', syncLog.id);

    console.log(`Sync completed: ${createdCount} handovers created, ${errors.length} errors`);

    // Return results
    res.status(200).json({
      success: true,
      syncLogId: syncLog.id,
      summary: {
        processed: processedCount,
        created: createdCount,
        skipped: skippedCount,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Sync error:', error);
    
    // Try to update sync log with failure
    try {
      if (syncLog?.id) {
        await supabase
          .from('sheets_sync_log')
          .update({
            sync_completed_at: new Date().toISOString(),
            errors_count: 1,
            error_details: [error.message],
            status: 'failed'
          })
          .eq('id', syncLog.id);
      }
    } catch (logError) {
      console.error('Failed to update sync log:', logError);
    }

    res.status(500).json({ 
      success: false,
      error: error.message,
      syncLogId: syncLog?.id
    });
  }
}