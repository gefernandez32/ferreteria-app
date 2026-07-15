/**
 * Cliente HTTP mínimo para hablar con los route handlers locales.
 * Sin axios: fetch + manejo de error uniforme.
 */

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "HttpError"
  }
}

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let mensaje = res.statusText
    try {
      const body = (await res.json()) as { error?: string }
      if (body?.error) mensaje = body.error
    } catch {
      // respuesta sin cuerpo JSON
    }
    throw new HttpError(res.status, mensaje)
  }
  return res.json() as Promise<T>
}

export async function getJson<T>(url: string): Promise<T> {
  return parse<T>(await fetch(url))
}

export async function patchJson<T>(url: string, body: unknown): Promise<T> {
  return parse<T>(
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  )
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  return parse<T>(
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  )
}

/** Construye un querystring omitiendo valores vacíos/undefined. */
export function toQuery(params: Record<string, string | number | undefined | null>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v))
  }
  const s = sp.toString()
  return s ? `?${s}` : ""
}
