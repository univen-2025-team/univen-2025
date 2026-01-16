export const getThemeColor = (colorName: string): string => {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(`--${colorName}`).trim()
}

