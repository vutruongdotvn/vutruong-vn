import { supabase } from "@/lib/supabase";
import { SecretItem } from "@/types/secret";

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    "Authorization": session ? `Bearer ${session.access_token}` : "",
  };
}

export async function fetchSecrets(): Promise<SecretItem[]> {
  try {
    const res = await fetch("/api/secrets", { headers: await getAuthHeaders() });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error("Fetch Secrets Error:", err);
    return [];
  }
}

export async function createSecret(data: Partial<SecretItem>) {
  try {
    const res = await fetch("/api/secrets", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, error: "Lỗi kết nối tới Server" };
  }
}

export async function updateSecret(id: string, data: Partial<SecretItem>) {
  try {
    const res = await fetch("/api/secrets", {
      method: "PUT",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ id, ...data }),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, error: "Lỗi kết nối tới Server" };
  }
}

export async function deleteSecret(id: string) {
  try {
    const res = await fetch("/api/secrets", {
      method: "DELETE",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ id }),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, error: "Lỗi kết nối tới Server" };
  }
}