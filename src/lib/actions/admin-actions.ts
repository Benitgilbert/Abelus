"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { UserRole } from "@/types";

/**
 * Creates a new user (Staff or Market Client) from the Admin Dashboard.
 * Uses the Service Role to bypass email confirmation and set roles.
 */
export async function adminCreateUser(formData: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  creditLimit?: number;
}) {
  const supabase = await createServerClient();
  
  // 1. Verify requester is an Admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: "Forbidden: Only admins can create accounts." };
  }

  // 2. Create user in Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: { full_name: formData.fullName }
  });

  if (authError) return { error: authError.message };

  // 3. Create profile
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: formData.fullName,
      role: formData.role
    });

  if (profileError) {
    // Cleanup auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { error: profileError.message };
  }

  // 4. If Market Client, initialize market record
  if (formData.role === 'client' && formData.creditLimit !== undefined) {
    const { error: marketError } = await supabaseAdmin
      .from('clients_market')
      .insert({
        id: authData.user.id,
        org_name: formData.fullName,
        credit_limit: formData.creditLimit,
        debt_balance: 0
      });

    if (marketError) {
       return { error: "User created, but failed to initialize Market record: " + marketError.message };
    }
  }

  return { success: true, userId: authData.user.id };
}

/**
 * Public registration for normal clients.
 * This does NOT use the service role; it relies on normal Supabase sign-up.
 */
export async function publicRegister(formData: {
  email: string;
  password: string;
  fullName: string;
}) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        role: 'client',
        full_name: formData.fullName
      }
    }
  });

  if (error) return { error: error.message };

  // Profile is usually created via a database trigger in Supabase,
  // but we'll ensure it exists here just in case.
  if (data.user) {
    await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        full_name: formData.fullName,
        role: 'client'
      });
  }

  return { success: true };
}
