-- Create design_tokens table for storing Figma design tokens
CREATE TABLE IF NOT EXISTS design_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('color', 'typography', 'spacing', 'border', 'shadow')),
    value TEXT NOT NULL,
    description TEXT,
    source VARCHAR(50) NOT NULL DEFAULT 'figma',
    file_key VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique tokens per file
    UNIQUE(name, file_key, source)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_design_tokens_file_key ON design_tokens(file_key);
CREATE INDEX IF NOT EXISTS idx_design_tokens_type ON design_tokens(type);
CREATE INDEX IF NOT EXISTS idx_design_tokens_source ON design_tokens(source);

-- Enable RLS
ALTER TABLE design_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Users can manage design tokens" ON design_tokens
    FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_design_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_design_tokens_updated_at ON design_tokens;
CREATE TRIGGER update_design_tokens_updated_at
    BEFORE UPDATE ON design_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_design_tokens_updated_at();

-- Insert some example design tokens to demonstrate the structure
INSERT INTO design_tokens (name, type, value, description, source, file_key) VALUES
('primary-blue', 'color', '#2D7EF8', 'Primary brand blue color', 'ofir-system', 'manual'),
('secondary-green', 'color', '#00D4AA', 'Secondary accent green', 'ofir-system', 'manual'),
('error-red', 'color', '#FF5A5F', 'Error state red', 'ofir-system', 'manual'),
('warning-orange', 'color', '#FFB020', 'Warning state orange', 'ofir-system', 'manual'),
('success-green', 'color', '#00C896', 'Success state green', 'ofir-system', 'manual'),
('spacing-xs', 'spacing', '4', 'Extra small spacing', 'ofir-system', 'manual'),
('spacing-sm', 'spacing', '8', 'Small spacing', 'ofir-system', 'manual'),
('spacing-md', 'spacing', '16', 'Medium spacing', 'ofir-system', 'manual'),
('spacing-lg', 'spacing', '24', 'Large spacing', 'ofir-system', 'manual'),
('spacing-xl', 'spacing', '32', 'Extra large spacing', 'ofir-system', 'manual'),
('radius-sm', 'border', '8', 'Small border radius', 'ofir-system', 'manual'),
('radius-md', 'border', '12', 'Medium border radius', 'ofir-system', 'manual'),
('radius-lg', 'border', '16', 'Large border radius', 'ofir-system', 'manual'),
('shadow-sm', 'shadow', '0 2px 8px rgba(45, 126, 248, 0.08)', 'Small shadow', 'ofir-system', 'manual'),
('shadow-md', 'shadow', '0 4px 20px rgba(45, 126, 248, 0.15)', 'Medium shadow', 'ofir-system', 'manual'),
('shadow-lg', 'shadow', '0 8px 30px rgba(45, 126, 248, 0.25)', 'Large shadow', 'ofir-system', 'manual');

-- Create a view for easier querying of design tokens by type
CREATE OR REPLACE VIEW design_tokens_by_type AS
SELECT 
    type,
    COUNT(*) as token_count,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'name', name,
            'value', value,
            'description', description,
            'source', source,
            'file_key', file_key,
            'updated_at', updated_at
        )
    ) as tokens
FROM design_tokens
GROUP BY type;

-- Grant necessary permissions
GRANT ALL ON design_tokens TO authenticated;
GRANT ALL ON design_tokens_by_type TO authenticated;