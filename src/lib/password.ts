export interface PasswordRule {
  id: string;
  label: string;
  ok: boolean;
}

export interface PasswordStrengthResult {
  valid: boolean;
  score: number;
  maxScore: number;
  level: 'vazia' | 'fraca' | 'media' | 'forte';
  label: string;
  rules: PasswordRule[];
  firstError: string | null;
}

const SPECIAL_CHAR = /[^A-Za-z0-9]/;

/** Detecta 3+ letras ou dígitos em sequência crescente ou decrescente (ex.: abc, 321). */
export function hasSequentialRun(value: string, runLength = 3): boolean {
  const text = value.toLowerCase();
  if (text.length < runLength) return false;

  for (let i = 0; i <= text.length - runLength; i += 1) {
    const slice = text.slice(i, i + runLength);
    const onlyLetters = /^[a-z]+$/.test(slice);
    const onlyDigits = /^\d+$/.test(slice);
    if (!onlyLetters && !onlyDigits) continue;

    let ascending = true;
    let descending = true;
    for (let j = 1; j < slice.length; j += 1) {
      const prev = slice.charCodeAt(j - 1);
      const curr = slice.charCodeAt(j);
      if (curr !== prev + 1) ascending = false;
      if (curr !== prev - 1) descending = false;
    }
    if (ascending || descending) return true;
  }

  return false;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const value = password;
  const rules: PasswordRule[] = [
    {
      id: 'length',
      label: 'Pelo menos 8 caracteres',
      ok: value.length >= 8
    },
    {
      id: 'upper',
      label: 'Uma letra maiúscula',
      ok: /[A-Z]/.test(value)
    },
    {
      id: 'lower',
      label: 'Uma letra minúscula',
      ok: /[a-z]/.test(value)
    },
    {
      id: 'number',
      label: 'Um número',
      ok: /\d/.test(value)
    },
    {
      id: 'special',
      label: 'Um caractere especial (ex.: !@#$%)',
      ok: SPECIAL_CHAR.test(value)
    },
    {
      id: 'sequence',
      label: 'Sem letras ou números em sequência (ex.: abc, 123)',
      ok: value.length === 0 ? false : !hasSequentialRun(value)
    }
  ];

  if (!value) {
    return {
      valid: false,
      score: 0,
      maxScore: rules.length,
      level: 'vazia',
      label: 'Digite uma senha',
      rules: rules.map((rule) => ({ ...rule, ok: false })),
      firstError: 'Informe uma senha.'
    };
  }

  const score = rules.filter((rule) => rule.ok).length;
  const valid = score === rules.length;
  const failed = rules.find((rule) => !rule.ok);

  let level: PasswordStrengthResult['level'] = 'fraca';
  let label = 'Senha fraca';
  if (score >= rules.length) {
    level = 'forte';
    label = 'Senha forte';
  } else if (score >= 4) {
    level = 'media';
    label = 'Senha média';
  }

  return {
    valid,
    score,
    maxScore: rules.length,
    level,
    label,
    rules,
    firstError: failed ? `A senha precisa ter: ${failed.label.toLowerCase()}.` : null
  };
}

export function assertStrongPassword(password: string) {
  const result = evaluatePasswordStrength(password);
  if (!result.valid) {
    throw new Error(result.firstError || 'A senha não atende aos requisitos de segurança.');
  }
  return result;
}
