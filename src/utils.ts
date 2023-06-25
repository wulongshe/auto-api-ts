export function capitalizedWord(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function lowerWord(word: string): string {
  return word.charAt(0).toLowerCase() + word.slice(1)
}

export function joinFilter(arr: (string | undefined)[], splitter = ', '): string {
  return arr.filter((item) => item).join(splitter)
}

export function camelCase(words: string[]): string {
  return words.map((word, index) => (index === 0 ? lowerWord(word) : capitalizedWord(word))).join('')
}
