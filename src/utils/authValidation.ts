const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9]/g;

export function validateEmail(email: string): string | null {
  if (!EMAIL_REGEX.test(email)) {
    return 'Введите корректный Email';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) {
    return 'Пароль должен содержать не менее 6 символов';
  }
  const specialCount = (password.match(SPECIAL_CHAR_REGEX) || []).length;
  if (specialCount < 2) {
    return 'Пароль должен содержать не менее 2 спецсимволов';
  }
  if (!/[A-ZА-Я]/.test(password)) {
    return 'Пароль должен содержать как минимум одну заглавную букву';
  }
  return null;
}

export function validatePasswordMatch(
  password: string,
  repeat: string,
): string | null {
  if (password !== repeat) {
    return 'Пароли не совпадают';
  }
  return null;
}
