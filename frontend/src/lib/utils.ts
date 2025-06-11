export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(' ')
}
