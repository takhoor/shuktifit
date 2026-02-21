// Inline Vercel request/response types to avoid @vercel/node dependency resolution issues
export interface VercelRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body: Record<string, unknown>;
  query: Record<string, string | string[]>;
}

export interface VercelResponse {
  status(code: number): VercelResponse;
  json(data: unknown): VercelResponse;
  redirect(statusCode: number, url: string): VercelResponse;
  end(): VercelResponse;
}
