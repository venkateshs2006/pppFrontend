import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

// Helper function to determine from email
function getFromEmail() {
  const domain = Deno.env.get('RESEND_DOMAIN');
  if (domain) {
    return `send@${domain}`;
  }
  return 'onboarding@resend.dev'; // Default fallback
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data } = await req.json();

    switch (action) {
      case 'send_sla_warning':
        return await handleSLAWarning(supabaseClient, data);
      case 'send_task_assignment':
        return await handleTaskAssignment(supabaseClient, data);
      case 'send_project_update':
        return await handleProjectUpdate(supabaseClient, data);
      case 'send_ticket_notification':
        return await handleTicketNotification(supabaseClient, data);
      case 'check_sla_status':
        return await checkSLAStatus(supabaseClient);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleSLAWarning(supabaseClient: any, data: any) {
  const { slaId, userId, projectName, dueDate } = data;

  // Get user profile and email
  const { data: userProfile, error: userError } = await supabaseClient
    .from('user_profiles_2025_10_30_10_19')
    .select('full_name')
    .eq('id', userId)
    .single();

  if (userError) throw userError;

  const { data: authUser, error: authError } = await supabaseClient.auth.admin
    .getUserById(userProfile.user_id);

  if (authError) throw authError;

  // Create notification in database
  const { error: notificationError } = await supabaseClient
    .from('notifications_2025_10_30_10_19')
    .insert({
      user_id: userId,
      title: 'تحذير SLA - اقتراب موعد الانتهاء',
      message: `المشروع "${projectName}" يقترب من موعد الانتهاء المحدد في ${new Date(dueDate).toLocaleDateString('ar-SA')}`,
      type: 'sla_warning',
      related_id: slaId
    });

  if (notificationError) throw notificationError;

  // Send email notification
  const emailResult = await sendEmail({
    to: authUser.user.email,
    subject: 'تحذير SLA - اقتراب موعد الانتهاء',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2>مرحباً ${userProfile.full_name}</h2>
        <p>نود إعلامك بأن المشروع "${projectName}" يقترب من موعد الانتهاء المحدد.</p>
        <p><strong>تاريخ الانتهاء:</strong> ${new Date(dueDate).toLocaleDateString('ar-SA')}</p>
        <p>يرجى اتخاذ الإجراءات اللازمة لضمان إنجاز المهام في الوقت المحدد.</p>
        <p>مع تحيات فريق إدارة السياسات والإجراءات</p>
      </div>
    `
  });

  // Update notification as email sent
  await supabaseClient
    .from('notifications_2025_10_30_10_19')
    .update({ is_email_sent: true })
    .eq('user_id', userId)
    .eq('related_id', slaId)
    .eq('type', 'sla_warning');

  return new Response(
    JSON.stringify({ success: true, emailResult }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleTaskAssignment(supabaseClient: any, data: any) {
  const { taskId, assignedUserId, taskTitle, projectName, assignedBy } = data;

  // Get assigned user profile and email
  const { data: userProfile, error: userError } = await supabaseClient
    .from('user_profiles_2025_10_30_10_19')
    .select('full_name, user_id')
    .eq('id', assignedUserId)
    .single();

  if (userError) throw userError;

  const { data: authUser, error: authError } = await supabaseClient.auth.admin
    .getUserById(userProfile.user_id);

  if (authError) throw authError;

  // Get assigner name
  const { data: assignerProfile } = await supabaseClient
    .from('user_profiles_2025_10_30_10_19')
    .select('full_name')
    .eq('id', assignedBy)
    .single();

  // Create notification
  const { error: notificationError } = await supabaseClient
    .from('notifications_2025_10_30_10_19')
    .insert({
      user_id: assignedUserId,
      title: 'تم تعيين مهمة جديدة',
      message: `تم تعيين مهمة "${taskTitle}" لك في مشروع "${projectName}"`,
      type: 'task_assigned',
      related_id: taskId
    });

  if (notificationError) throw notificationError;

  // Send email
  const emailResult = await sendEmail({
    to: authUser.user.email,
    subject: 'تم تعيين مهمة جديدة',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2>مرحباً ${userProfile.full_name}</h2>
        <p>تم تعيين مهمة جديدة لك:</p>
        <p><strong>اسم المهمة:</strong> ${taskTitle}</p>
        <p><strong>المشروع:</strong> ${projectName}</p>
        <p><strong>تم التعيين بواسطة:</strong> ${assignerProfile?.full_name || 'مدير المشروع'}</p>
        <p>يرجى تسجيل الدخول إلى المنصة لمراجعة تفاصيل المهمة.</p>
        <p>مع تحيات فريق إدارة السياسات والإجراءات</p>
      </div>
    `
  });

  return new Response(
    JSON.stringify({ success: true, emailResult }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleProjectUpdate(supabaseClient: any, data: any) {
  const { projectId, updateType, message, updatedBy } = data;

  // Get project details and members
  const { data: project, error: projectError } = await supabaseClient
    .from('projects_2025_10_30_10_19')
    .select('name')
    .eq('id', projectId)
    .single();

  if (projectError) throw projectError;

  const { data: members, error: membersError } = await supabaseClient
    .from('project_members_2025_10_30_10_19')
    .select(`
      user_id,
      user_profiles_2025_10_30_10_19!inner(full_name, user_id)
    `)
    .eq('project_id', projectId);

  if (membersError) throw membersError;

  // Get updater name
  const { data: updaterProfile } = await supabaseClient
    .from('user_profiles_2025_10_30_10_19')
    .select('full_name')
    .eq('id', updatedBy)
    .single();

  // Send notifications to all project members
  for (const member of members) {
    // Create notification
    await supabaseClient
      .from('notifications_2025_10_30_10_19')
      .insert({
        user_id: member.user_id,
        title: 'تحديث المشروع',
        message: `تحديث جديد في مشروع "${project.name}": ${message}`,
        type: 'project_update',
        related_id: projectId
      });

    // Get user email
    const { data: authUser } = await supabaseClient.auth.admin
      .getUserById(member.user_profiles_2025_10_30_10_19.user_id);

    if (authUser?.user?.email) {
      await sendEmail({
        to: authUser.user.email,
        subject: `تحديث المشروع - ${project.name}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif;">
            <h2>مرحباً ${member.user_profiles_2025_10_30_10_19.full_name}</h2>
            <p>يوجد تحديث جديد في مشروع "${project.name}":</p>
            <p><strong>نوع التحديث:</strong> ${updateType}</p>
            <p><strong>التفاصيل:</strong> ${message}</p>
            <p><strong>تم التحديث بواسطة:</strong> ${updaterProfile?.full_name || 'مدير المشروع'}</p>
            <p>يرجى تسجيل الدخول إلى المنصة لمراجعة التحديثات.</p>
            <p>مع تحيات فريق إدارة السياسات والإجراءات</p>
          </div>
        `
      });
    }
  }

  return new Response(
    JSON.stringify({ success: true, notificationsSent: members.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleTicketNotification(supabaseClient: any, data: any) {
  const { ticketId, assignedUserId, ticketTitle, priority, createdBy } = data;

  // Get assigned user details
  const { data: userProfile, error: userError } = await supabaseClient
    .from('user_profiles_2025_10_30_10_19')
    .select('full_name, user_id')
    .eq('id', assignedUserId)
    .single();

  if (userError) throw userError;

  const { data: authUser, error: authError } = await supabaseClient.auth.admin
    .getUserById(userProfile.user_id);

  if (authError) throw authError;

  // Get creator name
  const { data: creatorProfile } = await supabaseClient
    .from('user_profiles_2025_10_30_10_19')
    .select('full_name')
    .eq('id', createdBy)
    .single();

  // Create notification
  const { error: notificationError } = await supabaseClient
    .from('notifications_2025_10_30_10_19')
    .insert({
      user_id: assignedUserId,
      title: 'تذكرة جديدة',
      message: `تم تعيين تذكرة جديدة "${ticketTitle}" لك بأولوية ${priority}`,
      type: 'ticket_created',
      related_id: ticketId
    });

  if (notificationError) throw notificationError;

  // Send email
  const emailResult = await sendEmail({
    to: authUser.user.email,
    subject: 'تذكرة جديدة تحتاج إلى اهتمامك',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2>مرحباً ${userProfile.full_name}</h2>
        <p>تم تعيين تذكرة جديدة لك:</p>
        <p><strong>عنوان التذكرة:</strong> ${ticketTitle}</p>
        <p><strong>الأولوية:</strong> ${priority}</p>
        <p><strong>تم الإنشاء بواسطة:</strong> ${creatorProfile?.full_name || 'مستخدم'}</p>
        <p>يرجى تسجيل الدخول إلى المنصة لمراجعة التذكرة والرد عليها.</p>
        <p>مع تحيات فريق إدارة السياسات والإجراءات</p>
      </div>
    `
  });

  return new Response(
    JSON.stringify({ success: true, emailResult }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function checkSLAStatus(supabaseClient: any) {
  // Get SLA items that are at risk or overdue
  const { data: slaItems, error: slaError } = await supabaseClient
    .from('sla_tracking_2025_10_30_10_19')
    .select(`
      *,
      projects_2025_10_30_10_19!inner(name),
      tasks_2025_10_30_10_19(title, assigned_to),
      tickets_2025_10_30_10_19(title, assigned_to)
    `)
    .in('status', ['at_risk', 'overdue']);

  if (slaError) throw slaError;

  const notifications = [];

  for (const sla of slaItems) {
    const targetDate = new Date(sla.target_date);
    const now = new Date();
    const hoursUntilDue = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Send warning if within warning threshold
    if (hoursUntilDue <= sla.warning_threshold_hours && hoursUntilDue > 0) {
      let assignedUserId = null;
      
      if (sla.task_id && sla.tasks_2025_10_30_10_19?.assigned_to) {
        assignedUserId = sla.tasks_2025_10_30_10_19.assigned_to;
      } else if (sla.ticket_id && sla.tickets_2025_10_30_10_19?.assigned_to) {
        assignedUserId = sla.tickets_2025_10_30_10_19.assigned_to;
      }

      if (assignedUserId) {
        await handleSLAWarning(supabaseClient, {
          slaId: sla.id,
          userId: assignedUserId,
          projectName: sla.projects_2025_10_30_10_19.name,
          dueDate: sla.target_date
        });
        notifications.push(sla.id);
      }
    }

    // Update status to overdue if past due date
    if (hoursUntilDue <= 0 && sla.status !== 'overdue') {
      await supabaseClient
        .from('sla_tracking_2025_10_30_10_19')
        .update({ status: 'overdue' })
        .eq('id', sla.id);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      checkedItems: slaItems.length,
      notificationsSent: notifications.length 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendEmail(emailData: { to: string; subject: string; html: string }) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not found');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  return { success: true, message_id: result.id };
}