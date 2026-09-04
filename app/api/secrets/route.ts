import { NextResponse } from "next/server";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { requireAppAdmin } from "@/lib/server/requireAppAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BODY_BYTES = 64 * 1024;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const STRING_FIELD_LIMITS = {
  title: 500,
  account: 4_096,
  password: 8_192,
  email: 4_096,
  recovery_email: 4_096,
  phone: 512,
  recovery_phone: 512,
  secret_code: 8_192,
  notes: 20_000,
} as const;

const MAX_TAGS = 100;
const MAX_TAG_LENGTH = 128;

type SecretStringField = keyof typeof STRING_FIELD_LIMITS;
type SecretWritePayload = Partial<Record<SecretStringField, string | null>> & {
  tags?: string[];
  updated_at?: string;
};

class RequestValidationError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
  }
}

function json(
  body: Record<string, unknown>,
  init: { status?: number } = {}
) {
  return NextResponse.json(body, {
    status: init.status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJsonObject(req: Request): Promise<Record<string, unknown>> {
  const declaredLength = Number(req.headers.get("content-length"));

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_REQUEST_BODY_BYTES
  ) {
    throw new RequestValidationError("Dữ liệu gửi lên quá lớn.", 413);
  }

  const rawBody = await req.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BODY_BYTES) {
    throw new RequestValidationError("Dữ liệu gửi lên quá lớn.", 413);
  }

  let value: unknown;
  try {
    value = JSON.parse(rawBody);
  } catch {
    throw new RequestValidationError("Dữ liệu JSON không hợp lệ.");
  }

  if (!isRecord(value)) {
    throw new RequestValidationError("Dữ liệu yêu cầu không hợp lệ.");
  }

  return value;
}

function readUuid(body: Record<string, unknown>): string {
  const id = body.id;
  if (typeof id !== "string" || !UUID_PATTERN.test(id)) {
    throw new RequestValidationError("ID dữ liệu không hợp lệ.");
  }
  return id.toLowerCase();
}

function buildWritePayload(
  body: Record<string, unknown>,
  requireTitle: boolean
): SecretWritePayload {
  const payload: SecretWritePayload = {};

  for (const [field, maxLength] of Object.entries(
    STRING_FIELD_LIMITS
  ) as [SecretStringField, number][]) {
    if (!(field in body)) continue;

    const value = body[field];
    if (value !== null && typeof value !== "string") {
      throw new RequestValidationError(
        `Trường ${field} phải là chuỗi hoặc null.`
      );
    }

    if (typeof value === "string" && value.length > maxLength) {
      throw new RequestValidationError(
        `Trường ${field} vượt quá giới hạn cho phép.`
      );
    }

    if (field === "password" || field === "secret_code") {
      payload[field] =
        typeof value === "string" && value.length > 0
          ? encryptSecret(value)
          : null;
    } else {
      payload[field] = value;
    }
  }

  if (requireTitle) {
    if (typeof payload.title !== "string" || !payload.title.trim()) {
      throw new RequestValidationError("Tên dịch vụ không được để trống.");
    }
    payload.title = payload.title.trim();
  } else if (typeof payload.title === "string") {
    if (!payload.title.trim()) {
      throw new RequestValidationError("Tên dịch vụ không được để trống.");
    }
    payload.title = payload.title.trim();
  }

  if ("tags" in body) {
    if (!Array.isArray(body.tags) || body.tags.length > MAX_TAGS) {
      throw new RequestValidationError("Danh sách tags không hợp lệ.");
    }

    const tags = body.tags.map((tag) => {
      if (typeof tag !== "string") {
        throw new RequestValidationError("Mỗi tag phải là một chuỗi.");
      }

      const normalized = tag.trim();
      if (!normalized || normalized.length > MAX_TAG_LENGTH) {
        throw new RequestValidationError("Tag không hợp lệ.");
      }
      return normalized;
    });

    payload.tags = [...new Set(tags)];
  }

  if (Object.keys(payload).length === 0) {
    throw new RequestValidationError("Không có trường hợp lệ để cập nhật.");
  }

  return payload;
}

function handleRouteError(operation: string, error: unknown) {
  if (error instanceof RequestValidationError) {
    return json(
      { success: false, error: error.message },
      { status: error.status }
    );
  }

  console.error(`Secrets API ${operation} failed:`, {
    message: error instanceof Error ? error.message : "Unknown error",
  });
  return json(
    { success: false, error: "Không thể xử lý dữ liệu mật lúc này." },
    { status: 500 }
  );
}

export async function GET(req: Request) {
  try {
    const authorization = await requireAppAdmin(req);
    if (!authorization.ok) return authorization.response;

    const { data, error } = await authorization.supabase
      .from("secrets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const decryptedData = (data ?? []).map((item) => ({
      ...item,
      password: item.password ? decryptSecret(item.password) : "",
      secret_code: item.secret_code ? decryptSecret(item.secret_code) : "",
    }));

    return json({ success: true, data: decryptedData });
  } catch (error: unknown) {
    return handleRouteError("GET", error);
  }
}

export async function POST(req: Request) {
  try {
    const authorization = await requireAppAdmin(req);
    if (!authorization.ok) return authorization.response;

    const body = await readJsonObject(req);
    const payload = buildWritePayload(body, true);
    if (!("tags" in payload)) payload.tags = [];

    const { data, error } = await authorization.supabase
      .from("secrets")
      .insert(payload)
      .select("id")
      .single();

    if (error) throw error;

    return json({ success: true, data: { id: data.id } }, { status: 201 });
  } catch (error: unknown) {
    return handleRouteError("POST", error);
  }
}

export async function PUT(req: Request) {
  try {
    const authorization = await requireAppAdmin(req);
    if (!authorization.ok) return authorization.response;

    const body = await readJsonObject(req);
    const id = readUuid(body);
    const payload = buildWritePayload(body, false);
    payload.updated_at = new Date().toISOString();

    const { data, error } = await authorization.supabase
      .from("secrets")
      .update(payload)
      .eq("id", id)
      .select("id")
      .single();

    if (error) throw error;

    return json({ success: true, data: { id: data.id } });
  } catch (error: unknown) {
    return handleRouteError("PUT", error);
  }
}

export async function DELETE(req: Request) {
  try {
    const authorization = await requireAppAdmin(req);
    if (!authorization.ok) return authorization.response;

    const body = await readJsonObject(req);
    const id = readUuid(body);
    const { error } = await authorization.supabase
      .from("secrets")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return json({ success: true });
  } catch (error: unknown) {
    return handleRouteError("DELETE", error);
  }
}
