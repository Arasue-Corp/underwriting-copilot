CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    other_tag_text TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    assignee_id UUID REFERENCES auth.users(id),
    creator_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'PENDING',
    notified_1d_before BOOLEAN DEFAULT FALSE,
    notified_1h_before BOOLEAN DEFAULT FALSE,
    notified_15m_before BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Tasks Policies
-- Agents can see tasks assigned to them or created by them.
-- Managers/Admins can see all tasks.
CREATE POLICY "Users can view relevant tasks" ON public.tasks
FOR SELECT USING (
    assignee_id = auth.uid() OR 
    creator_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('MANAGER', 'ADMIN')
    )
);

CREATE POLICY "Users can insert their own tasks" ON public.tasks
FOR INSERT WITH CHECK (
    creator_id = auth.uid()
);

CREATE POLICY "Users can update relevant tasks" ON public.tasks
FOR UPDATE USING (
    assignee_id = auth.uid() OR 
    creator_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('MANAGER', 'ADMIN')
    )
);

CREATE POLICY "Users can delete their own tasks or if manager" ON public.tasks
FOR DELETE USING (
    creator_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('MANAGER', 'ADMIN')
    )
);

-- Notifications Policies
-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notifications" ON public.notifications
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON public.notifications
FOR DELETE USING (user_id = auth.uid());

-- Activity Logs Triggers
DROP TRIGGER IF EXISTS log_tasks ON public.tasks;
CREATE TRIGGER log_tasks
AFTER INSERT OR UPDATE OR DELETE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION log_activity();
