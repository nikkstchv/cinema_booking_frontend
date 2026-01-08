import { onMounted, onUnmounted, type Ref } from 'vue'

export function useFocusTrap(containerRef: Ref<HTMLElement | null>, onEscape?: () => void) {
  let previousActiveElement: HTMLElement | null = null

  const trapFocus = (e: KeyboardEvent) => {
    if (!containerRef.value) return

    const focusableElements = containerRef.value.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    if (e.key === 'Escape' && onEscape) {
      onEscape()
    }
  }

  onMounted(() => {
    previousActiveElement = document.activeElement as HTMLElement
    containerRef.value?.addEventListener('keydown', trapFocus)
    const firstFocusable = containerRef.value?.querySelector(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement
    firstFocusable?.focus()
  })

  onUnmounted(() => {
    containerRef.value?.removeEventListener('keydown', trapFocus)
    previousActiveElement?.focus()
  })
}
