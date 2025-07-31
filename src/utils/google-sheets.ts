// Google Sheets API utilities for employee synchronization
import { google } from 'googleapis';

// Types for Google Sheets operations
export interface EmployeeRow {
  employee_name: string;
  employee_email: string;
  job_code: string;
  job_title: string;
  departure_date: string;
  manager_email: string;
  processed: boolean;
  handover_id?: string;
  notes?: string;
  rowIndex: number; // Row number in the sheet (1-based)
}

export interface SyncResult {
  success: boolean;
  processedRows: number;
  createdHandovers: number;
  errors: string[];
  skippedRows: number;
}

/**
 * Get authenticated Google Sheets client
 * Uses service account authentication from environment variables
 */
const getSheetsClient = () => {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is required');
  }

  let credentials;
  try {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  } catch (error) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY format. Must be valid JSON.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return google.sheets({ version: 'v4', auth });
};

/**
 * Read departing employees data from Google Sheets
 * @param spreadsheetId - ID of the Google Sheets document
 * @param sheetName - Name of the sheet tab (default: "עובדים עוזבים")
 * @returns Promise<EmployeeRow[]> - Array of employee records
 */
export const readDepartingEmployees = async (
  spreadsheetId?: string,
  sheetName: string = 'עובדים עוזבים'
): Promise<EmployeeRow[]> => {
  const sheets = getSheetsClient();
  const sheetId = spreadsheetId || process.env.GOOGLE_SHEETS_ID;

  if (!sheetId) {
    throw new Error('GOOGLE_SHEETS_ID environment variable or spreadsheetId parameter is required');
  }

  try {
    // Read all data starting from row 2 (after headers)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A2:I`, // A=name, B=email, C=job_code, D=job_title, E=departure_date, F=manager_email, G=processed, H=handover_id, I=notes
    });

    const rows = response.data.values || [];
    const employees: EmployeeRow[] = [];

    rows.forEach((row, index) => {
      const rowIndex = index + 2; // +2 because we start from row 2 and arrays are 0-based

      // Skip empty rows
      if (!row || row.length === 0 || !row[0]) {
        return;
      }

      const [
        employee_name,
        employee_email,
        job_code,
        job_title,
        departure_date,
        manager_email,
        processed,
        handover_id,
        notes
      ] = row;

      // Basic validation
      if (!employee_name || !employee_email || !job_code || !departure_date || !manager_email) {
        console.warn(`Row ${rowIndex}: Missing required fields, skipping`);
        return;
      }

      employees.push({
        employee_name: employee_name.trim(),
        employee_email: employee_email.trim().toLowerCase(),
        job_code: job_code.trim().toUpperCase(),
        job_title: (job_title || '').trim(),
        departure_date: departure_date.trim(),
        manager_email: manager_email.trim().toLowerCase(),
        processed: processed === 'TRUE' || processed === true,
        handover_id: handover_id || undefined,
        notes: notes || undefined,
        rowIndex
      });
    });

    return employees;
  } catch (error) {
    console.error('Error reading Google Sheets:', error);
    throw new Error(`Failed to read departing employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Mark employee rows as processed in Google Sheets
 * @param spreadsheetId - ID of the Google Sheets document
 * @param updates - Array of updates with row indices and handover IDs
 * @param sheetName - Name of the sheet tab
 * @returns Promise<boolean> - Success status
 */
export const markEmployeesAsProcessed = async (
  updates: Array<{ rowIndex: number; handoverId: string }>,
  spreadsheetId?: string,
  sheetName: string = 'עובדים עוזבים'
): Promise<boolean> => {
  const sheets = getSheetsClient();
  const sheetId = spreadsheetId || process.env.GOOGLE_SHEETS_ID;

  if (!sheetId) {
    throw new Error('GOOGLE_SHEETS_ID environment variable or spreadsheetId parameter is required');
  }

  try {
    // Prepare batch update requests
    const batchUpdates = updates.map(({ rowIndex, handoverId }) => ({
      range: `${sheetName}!G${rowIndex}:H${rowIndex}`, // G=processed, H=handover_id
      values: [['TRUE', handoverId]]
    }));

    if (batchUpdates.length === 0) {
      return true;
    }

    // Execute batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: batchUpdates
      }
    });

    return true;
  } catch (error) {
    console.error('Error updating Google Sheets:', error);
    throw new Error(`Failed to mark employees as processed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Add error notes to employee rows in Google Sheets
 * @param errors - Array of errors with row indices and error messages
 * @param spreadsheetId - ID of the Google Sheets document
 * @param sheetName - Name of the sheet tab
 * @returns Promise<boolean> - Success status
 */
export const addErrorNotes = async (
  errors: Array<{ rowIndex: number; error: string }>,
  spreadsheetId?: string,
  sheetName: string = 'עובדים עוזבים'
): Promise<boolean> => {
  const sheets = getSheetsClient();
  const sheetId = spreadsheetId || process.env.GOOGLE_SHEETS_ID;

  if (!sheetId || errors.length === 0) {
    return true;
  }

  try {
    // Prepare batch update requests for notes column
    const batchUpdates = errors.map(({ rowIndex, error }) => ({
      range: `${sheetName}!I${rowIndex}`, // I=notes
      values: [[`ERROR: ${error} (${new Date().toISOString()})`]]
    }));

    // Execute batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: batchUpdates
      }
    });

    return true;
  } catch (error) {
    console.error('Error adding error notes to Google Sheets:', error);
    return false; // Don't throw here as this is a secondary operation
  }
};

/**
 * Validate Google Sheets structure and headers
 * @param spreadsheetId - ID of the Google Sheets document
 * @param sheetName - Name of the sheet tab
 * @returns Promise<boolean> - Whether the sheet structure is valid
 */
export const validateSheetStructure = async (
  spreadsheetId?: string,
  sheetName: string = 'עובדים עוזבים'
): Promise<{ isValid: boolean; error?: string }> => {
  const sheets = getSheetsClient();
  const sheetId = spreadsheetId || process.env.GOOGLE_SHEETS_ID;

  if (!sheetId) {
    return { isValid: false, error: 'GOOGLE_SHEETS_ID environment variable is required' };
  }

  try {
    // Read header row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:I1`,
    });

    const headers = response.data.values?.[0] || [];
    
    const expectedHeaders = [
      'employee_name',
      'employee_email', 
      'job_code',
      'job_title',
      'departure_date',
      'manager_email',
      'processed',
      'handover_id',
      'notes'
    ];

    // Check if all expected headers are present (case-insensitive)
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    const missingHeaders = expectedHeaders.filter(
      expected => !normalizedHeaders.includes(expected)
    );

    if (missingHeaders.length > 0) {
      return {
        isValid: false,
        error: `Missing required headers: ${missingHeaders.join(', ')}`
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to validate sheet structure: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Get sheet statistics for monitoring
 * @param spreadsheetId - ID of the Google Sheets document
 * @param sheetName - Name of the sheet tab
 * @returns Promise<object> - Sheet statistics
 */
export const getSheetStatistics = async (
  spreadsheetId?: string,
  sheetName: string = 'עובדים עוזבים'
): Promise<{
  totalRows: number;
  processedRows: number;
  unprocessedRows: number;
  errorRows: number;
}> => {
  try {
    const employees = await readDepartingEmployees(spreadsheetId, sheetName);
    
    const processedRows = employees.filter(emp => emp.processed).length;
    const errorRows = employees.filter(emp => emp.notes?.includes('ERROR')).length;
    
    return {
      totalRows: employees.length,
      processedRows,
      unprocessedRows: employees.length - processedRows,
      errorRows
    };
  } catch (error) {
    console.error('Error getting sheet statistics:', error);
    return {
      totalRows: 0,
      processedRows: 0,
      unprocessedRows: 0,
      errorRows: 0
    };
  }
};

/**
 * Validate employee data format
 * @param employee - Employee record to validate
 * @returns object - Validation result with errors
 */
export const validateEmployeeData = (employee: EmployeeRow): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Check required fields
  if (!employee.employee_name.trim()) {
    errors.push('Employee name is required');
  }

  if (!employee.employee_email.trim()) {
    errors.push('Employee email is required');
  } else {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employee.employee_email)) {
      errors.push('Invalid email format');
    }
  }

  if (!employee.job_code.trim()) {
    errors.push('Job code is required');
  } else {
    // Job code should match pattern like HR001, DEV002
    const jobCodeRegex = /^[A-Z]{2,4}\d{3}$/;
    if (!jobCodeRegex.test(employee.job_code)) {
      errors.push('Job code must be in format like HR001, DEV002');
    }
  }

  if (!employee.departure_date.trim()) {
    errors.push('Departure date is required');
  } else {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(employee.departure_date)) {
      errors.push('Departure date must be in YYYY-MM-DD format');
    } else {
      const date = new Date(employee.departure_date);
      if (isNaN(date.getTime())) {
        errors.push('Invalid departure date');
      }
    }
  }

  if (!employee.manager_email.trim()) {
    errors.push('Manager email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employee.manager_email)) {
      errors.push('Invalid manager email format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create or update the header row in Google Sheets
 * @param spreadsheetId - ID of the Google Sheets document
 * @param sheetName - Name of the sheet tab
 * @returns Promise<boolean> - Success status
 */
export const createSheetHeaders = async (
  spreadsheetId?: string,
  sheetName: string = 'עובדים עוזבים'
): Promise<boolean> => {
  const sheets = getSheetsClient();
  const sheetId = spreadsheetId || process.env.GOOGLE_SHEETS_ID;

  if (!sheetId) {
    throw new Error('GOOGLE_SHEETS_ID environment variable is required');
  }

  try {
    const headers = [
      'employee_name',
      'employee_email',
      'job_code', 
      'job_title',
      'departure_date',
      'manager_email',
      'processed',
      'handover_id',
      'notes'
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:I1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });

    return true;
  } catch (error) {
    console.error('Error creating sheet headers:', error);
    throw new Error(`Failed to create sheet headers: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export default {
  readDepartingEmployees,
  markEmployeesAsProcessed,
  addErrorNotes,
  validateSheetStructure,
  getSheetStatistics,
  validateEmployeeData,
  createSheetHeaders
};