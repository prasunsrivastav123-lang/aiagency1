export function required(value, label = 'This field') {
  return String(value || '').trim() ? '' : `${label} is required.`
}

export function maxLength(value, max, label = 'This field') {
  return String(value || '').length <= max ? '' : `${label} must be ${max} characters or fewer.`
}

export function phone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15 ? '' : 'Enter a valid phone number.'
}
