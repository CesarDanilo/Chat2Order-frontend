import { z } from "zod";

// Validação no cliente só para UX. A segurança fica no backend.
// Os limites são os mesmos do servidor (Chat2Order-backend/src/schemas/common.ts).
// Se o servidor mudar, atualize aqui também.

export const LIMITS = {
  name: { min: 3, max: 120 },
  email: { max: 254 },
  password: { min: 8, maxBytes: 72 },
  customerName: { max: 120 },
  phone: { max: 25 },
  address: { max: 500 },
  itemName: { max: 200 },
  quantity: { min: 1, max: 10000 },
  unitPrice: { min: 0, max: 1000000 },
  orderTotal: { max: 1000000000 },
  items: { min: 1, max: 100 },
  productName: { max: 160 },
  description: { max: 2000 },
  category: { max: 80 },
  productPrice: { max: 1000000 },
  rawMessage: { max: 50000 },
} as const;

export const PHONE_PATTERN = /^[0-9()+\-\s]+$/;

// Marcador de telefone não informado (pedidos criados pela IA). É aceito e gravado assim.
export const UNKNOWN_PHONE = "00000000000";

// Mesma regra do servidor (Chat2Order-backend/src/schemas/phone.ts).
// DDD sem zero; celular com 9 na frente; fixo começando de 2 a 5.
const BRAZILIAN_PHONE = /^[1-9][1-9](?:9[0-9]{8}|[2-5][0-9]{7})$/;
const INTERNATIONAL_DIGITS = /^[1-9][0-9]{7,14}$/;

// Grava só dígitos: nacional sem o 55; internacional no formato +E.164. Inválido devolve null.
export function normalizePhone(value: string): string | null {
  const text = value.trim();

  if (!PHONE_PATTERN.test(text)) return null;

  const digits = text.replace(/[^0-9]/g, "");

  if (digits === UNKNOWN_PHONE) return UNKNOWN_PHONE;

  if (text.startsWith("+") && !digits.startsWith("55")) {
    return INTERNATIONAL_DIGITS.test(digits) ? `+${digits}` : null;
  }

  const national = digits.length >= 12 && digits.startsWith("55") ? digits.slice(2) : digits;

  return BRAZILIAN_PHONE.test(national) ? national : null;
}

// Primeira mensagem de cada campo, com o caminho no formato da API (ex.: items.0.quantity).
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!Object.hasOwn(errors, key)) errors[key] = issue.message;
  }
  return errors;
}

// Senhas comuns, comparadas sem diferenciar maiúsculas (iguais ao servidor).
const COMMON_PASSWORDS = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "87654321",
  "password",
  "password1",
  "senha123",
  "qwerty123",
  "abcd1234",
  "11111111",
  "00000000",
]);

// Caracteres de controle (U+0000 a U+001F e U+007F) e surrogates isolados.
// Texto de uma linha não aceita nenhum controle; multilinha aceita \t, \n e \r.
const LINE_CONTROL_ALLOWED = new Set([0x09, 0x0a, 0x0d]);

function hasInvalidText(value: string, multiline: boolean): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);

    if ((code < 0x20 || code === 0x7f) && !(multiline && LINE_CONTROL_ALLOWED.has(code))) {
      return true;
    }

    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        i++;
        continue;
      }
      return true;
    }

    if (code >= 0xdc00 && code <= 0xdfff) return true;
  }

  return false;
}

// Regra de caracteres do texto digitado. Vira erro no próprio campo.
function checkText(
  value: string,
  ctx: { addIssue: (issue: { code: "custom"; message: string }) => void },
  message: string,
  multiline = false,
) {
  if (hasInvalidText(value, multiline)) ctx.addIssue({ code: "custom", message });
}

const hasAtMostTwoDecimals = (value: number) =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;

// =========================
// USUÁRIO / AUTENTICAÇÃO
// =========================

export const nameSchema = z
  .string("Informe o nome")
  .trim()
  .normalize("NFC")
  .min(LIMITS.name.min, `O nome deve ter no mínimo ${LIMITS.name.min} caracteres`)
  .max(LIMITS.name.max, `O nome deve ter no máximo ${LIMITS.name.max} caracteres`)
  .superRefine((value, ctx) => checkText(value, ctx, "O nome contém caracteres inválidos"));

// E-mail: trim e minúsculas antes de validar (e de enviar, pois o valor parseado é o usado).
export const emailSchema = z
  .string("Informe o e-mail")
  .trim()
  .toLowerCase()
  .min(1, "Informe o e-mail")
  .max(LIMITS.email.max, "O e-mail deve ter no máximo 254 caracteres")
  .pipe(z.email("E-mail inválido"));

// Regra de senha usada em cadastro e troca. Não tem trim: espaços fazem parte da senha.
export function getPasswordError(value: string): string | null {
  if (value === "") return "Informe a senha";
  if (value.length < LIMITS.password.min) {
    return `A senha deve ter no mínimo ${LIMITS.password.min} caracteres`;
  }
  if (new TextEncoder().encode(value).length > LIMITS.password.maxBytes) {
    return "A senha é longa demais";
  }
  if (value.trim() === "") return "A senha não pode ser só espaços";
  if (value.includes("\u0000")) return "A senha contém caracteres inválidos";
  if (COMMON_PASSWORDS.has(value.toLowerCase())) return "Escolha uma senha menos comum";
  return null;
}

// Senha obrigatória (cadastro de usuário e registro).
export const passwordSchema = z.string("Informe a senha").superRefine((value, ctx) => {
  const message = getPasswordError(value);
  if (message) ctx.addIssue({ code: "custom", message });
});

// Senha opcional (edição): vazia significa "não alterar", então não é validada.
export const optionalPasswordSchema = z
  .string()
  .superRefine((value, ctx) => {
    if (value === "") return;
    const message = getPasswordError(value);
    if (message) ctx.addIssue({ code: "custom", message });
  });

// Login: só exige preenchimento. A política de senha não se aplica aqui,
// porque contas antigas podem ter senha fora dela.
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string("Informe a senha").min(1, "Informe a senha"),
});

// POST /api/user: name, email, password.
export const userCreateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// PUT /api/user/:id: a senha é opcional e o admin só é enviado na edição pelo admin.
export const userUpdateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: optionalPasswordSchema,
  admin: z.boolean(),
});

// Cadastro na tela de login (name, email, password + confirmação, que não vai à API).
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "As senhas não coincidem",
      });
    }
  });

// Perfil: senha opcional; se preenchida, a confirmação precisa bater.
export const profileSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: optionalPasswordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "As senhas não coincidem",
      });
    }
  });

// =========================
// PEDIDOS
// =========================

export const customerNameSchema = z
  .string("Informe o nome do cliente")
  .trim()
  .normalize("NFC")
  .min(1, "O nome do cliente é obrigatório")
  .max(LIMITS.customerName.max, `O nome do cliente deve ter no máximo ${LIMITS.customerName.max} caracteres`)
  .superRefine((value, ctx) => checkText(value, ctx, "O nome do cliente contém caracteres inválidos"));

// Telefone: aceita máscara e grava normalizado (só dígitos, ou +E.164 para internacional).
export const phoneSchema = z
  .string("Informe o telefone")
  .trim()
  .min(1, "Informe o telefone")
  .max(LIMITS.phone.max, `O telefone deve ter no máximo ${LIMITS.phone.max} caracteres`)
  .regex(PHONE_PATTERN, "O telefone aceita apenas números, espaços, parênteses, + e -")
  .transform((value, ctx) => {
    const normalized = normalizePhone(value);
    if (normalized) return normalized;
    ctx.addIssue({ code: "custom", message: "Telefone inválido" });
    return z.NEVER;
  });

export const addressSchema = z
  .string("Informe o endereço")
  .trim()
  .normalize("NFC")
  .min(1, "O endereço é obrigatório")
  .max(LIMITS.address.max, `O endereço deve ter no máximo ${LIMITS.address.max} caracteres`)
  .superRefine((value, ctx) =>
    checkText(value, ctx, "O endereço contém caracteres inválidos", true),
  );

export const itemNameSchema = z
  .string("Informe o nome do produto")
  .trim()
  .normalize("NFC")
  .min(1, "O nome do produto é obrigatório")
  .max(LIMITS.itemName.max, `O nome do produto deve ter no máximo ${LIMITS.itemName.max} caracteres`)
  .superRefine((value, ctx) => checkText(value, ctx, "O nome do produto contém caracteres inválidos"));

export const quantitySchema = z
  .number("A quantidade deve ser um número")
  .int("A quantidade deve ser um número inteiro")
  .min(LIMITS.quantity.min, `A quantidade deve ser no mínimo ${LIMITS.quantity.min}`)
  .max(LIMITS.quantity.max, `A quantidade deve ser no máximo ${LIMITS.quantity.max}`);

export const unitPriceSchema = z
  .number("O preço unitário deve ser um número")
  .min(LIMITS.unitPrice.min, "O preço unitário não pode ser negativo")
  .max(LIMITS.unitPrice.max, `O preço unitário deve ser no máximo ${LIMITS.unitPrice.max}`)
  .refine(hasAtMostTwoDecimals, "O preço unitário deve ter no máximo 2 casas decimais");

export const orderItemSchema = z.object({
  productName: itemNameSchema,
  quantity: quantitySchema,
  unitPrice: unitPriceSchema,
  totalPrice: z.number("O total do item deve ser um número").min(0, "O total do item não pode ser negativo"),
});

export const orderItemsSchema = z
  .array(orderItemSchema)
  .min(LIMITS.items.min, "O pedido deve conter pelo menos 1 item")
  .max(LIMITS.items.max, `O pedido deve conter no máximo ${LIMITS.items.max} itens`);

export const rawMessageSchema = z
  .string()
  .trim()
  .normalize("NFC")
  .max(LIMITS.rawMessage.max, `A conversa importada deve ter no máximo ${LIMITS.rawMessage.max} caracteres`)
  .superRefine((value, ctx) =>
    checkText(value, ctx, "A conversa importada contém caracteres inválidos", true),
  )
  .optional();

export type OrderStatusValue = "PENDENTE" | "CONCLUIDO" | "CANCELADO";

// Transições de status (mesma regra do servidor). Manter o status atual é sempre permitido.
const ORDER_STATUS_TRANSITIONS: Record<OrderStatusValue, readonly OrderStatusValue[]> = {
  PENDENTE: ["CONCLUIDO", "CANCELADO"],
  CONCLUIDO: ["CANCELADO"],
  CANCELADO: [],
};

export function isOrderStatusTransitionAllowed(from: OrderStatusValue, to: OrderStatusValue): boolean {
  return from === to || ORDER_STATUS_TRANSITIONS[from].includes(to);
}

// Body de POST/PUT /api/order (total é recalculado no servidor).
export const orderFormSchema = z.object({
  customerName: customerNameSchema,
  customerPhone: phoneSchema,
  address: addressSchema,
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH"], "Forma de pagamento inválida"),
  total: z
    .number("O total deve ser um número")
    .min(0, "O total não pode ser negativo")
    .max(LIMITS.orderTotal.max, "O total do pedido não pode passar de R$ 1.000.000.000,00"),
  source: z.enum(["WHATSAPP", "SITE"], "Origem inválida"),
  rawMessage: rawMessageSchema,
  status: z.enum(["PENDENTE", "CONCLUIDO", "CANCELADO"], "Status inválido"),
  items: orderItemsSchema,
});

// =========================
// PRODUTOS
// =========================

export const productPriceSchema = z
  .number("O preço deve ser um número")
  .positive("O preço deve ser maior que 0")
  .max(LIMITS.productPrice.max, `O preço deve ser no máximo ${LIMITS.productPrice.max}`)
  .refine(hasAtMostTwoDecimals, "O preço deve ter no máximo 2 casas decimais");

// Body de POST/PUT /api/product: somente estes campos.
export const productFormSchema = z.object({
  name: z
    .string("Informe o nome do produto")
    .trim()
    .normalize("NFC")
    .min(1, "O nome do produto é obrigatório")
    .max(LIMITS.productName.max, `O nome do produto deve ter no máximo ${LIMITS.productName.max} caracteres`)
    .superRefine((value, ctx) =>
      checkText(value, ctx, "O nome do produto contém caracteres inválidos"),
    ),
  category: z
    .string()
    .trim()
    .normalize("NFC")
    .max(LIMITS.category.max, `A categoria deve ter no máximo ${LIMITS.category.max} caracteres`)
    .superRefine((value, ctx) => checkText(value, ctx, "A categoria contém caracteres inválidos")),
  description: z
    .string()
    .trim()
    .normalize("NFC")
    .max(LIMITS.description.max, `A descrição deve ter no máximo ${LIMITS.description.max} caracteres`)
    .superRefine((value, ctx) =>
      checkText(value, ctx, "A descrição contém caracteres inválidos", true),
    ),
  price: productPriceSchema,
  available: z.boolean(),
});
