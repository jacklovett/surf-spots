/**
 * Debounce function to control excessive resize events
 * @param action - function to be performed
 * @param delay - length of time to delay function call
 * @returns void - performs given action
 */
export const debounce = (action: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => action(...args), delay)
  }
}

// TODO: Does this work?
export const getCssVariable = (variable: string) =>
  getComputedStyle(document.body).getPropertyValue(variable)
