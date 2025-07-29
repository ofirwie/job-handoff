-- Row Level Security Policies for Flexible Handover System
-- Implements secure access based on user roles and organizational hierarchy

-- User Profiles Security
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "HR and Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('hr', 'admin')
        )
    );

CREATE POLICY "HR can create profiles" ON user_profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('hr', 'admin')
        )
    );

-- Handover Security
CREATE POLICY "View involved handovers" ON handovers
    FOR SELECT USING (
        leaving_employee_email = auth.email() OR
        incoming_employee_email = auth.email() OR
        manager_email = auth.email() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('hr', 'admin')
        )
    );

CREATE POLICY "Managers can update department handovers" ON handovers
    FOR UPDATE USING (
        manager_email = auth.email() OR
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN jobs j ON j.department_id = up.department_id
            WHERE up.id = auth.uid() 
            AND up.role IN ('manager', 'hr', 'admin')
            AND j.id = handovers.job_id
        )
    );

CREATE POLICY "Managers and HR can create handovers" ON handovers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('manager', 'hr', 'admin')
        )
    );

-- Template Security
CREATE POLICY "View plant templates" ON templates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN jobs j ON j.id = templates.job_id
            JOIN departments d ON d.id = j.department_id
            WHERE up.id = auth.uid() 
            AND (
                up.plant_id = d.plant_id OR 
                up.role IN ('hr', 'admin')
            )
        )
    );

CREATE POLICY "Managers can create templates" ON templates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('manager', 'hr', 'admin')
        )
    );

CREATE POLICY "Template owners can update" ON templates
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('hr', 'admin')
        )
    );

-- Template Items Security
CREATE POLICY "View template items with template access" ON template_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM templates t
            JOIN user_profiles up ON up.id = auth.uid()
            JOIN jobs j ON j.id = t.job_id
            JOIN departments d ON d.id = j.department_id
            WHERE t.id = template_items.template_id 
            AND (
                up.plant_id = d.plant_id OR 
                up.role IN ('hr', 'admin')
            )
        )
    );

CREATE POLICY "Template owners can manage items" ON template_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM templates t
            WHERE t.id = template_items.template_id 
            AND (
                t.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('hr', 'admin')
                )
            )
        )
    );

-- Handover Progress Security
CREATE POLICY "View progress for involved handovers" ON handover_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM handovers h
            WHERE h.id = handover_progress.handover_id 
            AND (
                h.leaving_employee_email = auth.email() OR
                h.incoming_employee_email = auth.email() OR
                h.manager_email = auth.email() OR
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('hr', 'admin')
                )
            )
        )
    );

CREATE POLICY "Update progress for involved users" ON handover_progress
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM handovers h
            WHERE h.id = handover_progress.handover_id 
            AND (
                h.leaving_employee_email = auth.email() OR
                h.incoming_employee_email = auth.email() OR
                h.manager_email = auth.email()
            )
        )
    );

-- Categories Security (public read, admin write)
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'hr')
        )
    );

-- Item Types Security (public read, admin write)
CREATE POLICY "Anyone can view item types" ON item_types
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage item types" ON item_types
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'hr')
        )
    );

-- Base Templates Security
CREATE POLICY "View base templates by plant" ON base_templates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND (
                role IN ('hr', 'admin') OR
                -- Users can see templates from their plant
                plant_id IS NOT NULL
            )
        )
    );

CREATE POLICY "Managers can create base templates" ON base_templates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('manager', 'hr', 'admin')
        )
    );

-- Adaptation Rules Security
CREATE POLICY "View adaptation rules" ON adaptation_rules
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage adaptation rules" ON adaptation_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'hr')
        )
    );

-- Learning Insights Security (admin/HR only)
CREATE POLICY "HR can view learning insights" ON learning_insights
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('hr', 'admin')
        )
    );

-- Audit Logs Security (admin/HR read-only)
CREATE POLICY "HR can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('hr', 'admin')
        )
    );

-- User Permissions Security
CREATE POLICY "View own permissions" ON user_permissions
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('hr', 'admin')
        )
    );

CREATE POLICY "Admins can manage permissions" ON user_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );