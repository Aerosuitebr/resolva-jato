const onlyDigits = (value: string) => value.replace(/\D+/g, '');

/** Valida e-mail com regra prática (RFC simplificada). */
export function isValidEmail(value: string): boolean {
  const email = value.trim();
  if (!email) return false;
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Valida telefone BR (10 dígitos fixo ou 11 celular, com DDD válido). */
export function isValidPhone(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 10 && digits.length !== 11) return false;
  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  if (digits.length === 11 && digits[2] !== '9') return false;
  return true;
}

/** Valida CEP (8 dígitos). */
export function isValidCep(value: string): boolean {
  return onlyDigits(value).length === 8;
}

/** Valida CPF com dígitos verificadores. */
export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcCheck = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(cpf[i]) * (length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calcCheck(9) === Number(cpf[9]) && calcCheck(10) === Number(cpf[10]);
}

/** Valida CNPJ com dígitos verificadores. */
export function isValidCnpj(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcCheck = (length: number) => {
    const weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(cnpj[i]) * weights[i];
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return calcCheck(12) === Number(cnpj[12]) && calcCheck(13) === Number(cnpj[13]);
}

/** Valida CPF ou CNPJ conforme o tamanho. */
export function isValidCpfCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length <= 11) return isValidCpf(value);
  return isValidCnpj(value);
}
