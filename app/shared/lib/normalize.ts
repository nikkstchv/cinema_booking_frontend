export function normalizeEntities<T extends { id: number }>(entities: T[]): Map<number, T> {
  const map = new Map<number, T>()
  entities.forEach((entity) => {
    map.set(entity.id, entity)
  })
  return map
}

export function createEntityMap<T extends { id: number }>(entities: Ref<T[] | undefined>): ComputedRef<Map<number, T>> {
  return computed(() => {
    if (!entities.value) {
      return new Map<number, T>()
    }
    return normalizeEntities(entities.value)
  })
}
