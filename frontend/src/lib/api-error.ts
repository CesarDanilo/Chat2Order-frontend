// Tratamento comum de erro de API.
// Contrato: { error: { code, message, details?: [{ field, code, message }] } }.
// `details` só existe em erros de validação. `field` pode ser aninhado (items.0.quantity) ou vazio.

export const DEFAULT_API_ERROR_MESSAGE =
  "Não foi possível concluir a operação. Tente novamente.";

export class ApiError extends Error {
  readonly status: number;
  // Código do contrato (ex.: VALIDATION_ERROR). Vazio se a API não enviou.
  readonly code: string;
  // Primeira mensagem por campo (campo pode ser aninhado ou vazio).
  // EMAIL_TAKEN também entra aqui, no campo `email`.
  readonly fields: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fields: Record<string, string> = {},
    code: string = "",
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Lê a resposta de erro. Corpo que não é JSON ou sem `error.message` usa a mensagem de reserva.
export async function readApiError(
  response: Response,
  fallback: string = DEFAULT_API_ERROR_MESSAGE,
): Promise<ApiError> {
  // Corpo que não é JSON vira null e cai na mensagem genérica.
  const body: unknown = await response.json().catch(() => null);

  const error = isRecord(body) && isRecord(body.error) ? body.error : {};

  const message =
    typeof error.message === "string" && error.message.trim() !== ""
      ? error.message
      : fallback;

  const code = typeof error.code === "string" ? error.code : "";

  const fields: Record<string, string> = {};

  if (Array.isArray(error.details)) {
    for (const detail of error.details) {
      if (
        isRecord(detail) &&
        typeof detail.field === "string" &&
        typeof detail.message === "string" &&
        detail.message !== "" &&
        !Object.hasOwn(fields, detail.field)
      ) {
        fields[detail.field] = detail.message;
      }
    }
  }

  // E-mail já cadastrado: a mensagem do servidor vai para o campo de e-mail.
  if (code === "EMAIL_TAKEN" && !Object.hasOwn(fields, "email")) {
    fields.email = message;
  }

  return new ApiError(response.status, message, fields, code);
}

// Mensagem para o usuário: a da API quando for ApiError; caso contrário, a reserva.
export function getErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_API_ERROR_MESSAGE,
): string {
  return error instanceof ApiError ? error.message : fallback;
}

// Mensagem para toast/alerta genérico. Sem details, é a mensagem da API.
// Com details, é a primeira que NÃO couber em um campo exibido (shownFields).
// Retorna null quando todos os erros já aparecem junto aos campos (evita repetir).
export function getGenericErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_API_ERROR_MESSAGE,
  shownFields: readonly string[] | ((field: string) => boolean) = [],
): string | null {
  if (!(error instanceof ApiError)) return fallback;

  const keys = Object.keys(error.fields);
  if (keys.length === 0) return error.message;

  const isShown =
    typeof shownFields === "function"
      ? shownFields
      : (field: string) => shownFields.includes(field);

  const unplaced = keys.find((key) => !isShown(key));

  return unplaced === undefined ? null : error.fields[unplaced];
}

// Erros por campo devolvidos pela API (vazio quando não for ApiError).
export function getApiFieldErrors(error: unknown): Record<string, string> {
  return error instanceof ApiError ? error.fields : {};
}
