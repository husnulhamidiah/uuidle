export function generateUUID() {
  return crypto.randomUUID();
}

export function classifyChar(inputChar, targetChar) {
  if (inputChar === targetChar) return 'correct';

  const isSameType =
    (/[a-f]/.test(inputChar) && /[a-f]/.test(targetChar)) ||
    (/[0-9]/.test(inputChar) && /[0-9]/.test(targetChar));

  if (isSameType) return 'type';

  return 'wrong';
}

export function evaluateGuess(guess, target) {
  return guess.split('').map((char, i) => ({
    char,
    status: classifyChar(char, target[i])
  }));
}
