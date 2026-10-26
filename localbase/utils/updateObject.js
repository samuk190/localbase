function isPlainObject(item) {
  return (
    item !== null &&
    typeof item === 'object' &&
    item.constructor === Object &&
    !(item instanceof Date) &&
    !(item instanceof RegExp) &&
    !(typeof Blob !== 'undefined' && item instanceof Blob) &&
    !(typeof File !== 'undefined' && item instanceof File)
  )
}

function setNestedProperty(target, path, value) {
  const keys = path.split('.')
  let current = target
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key] || !isPlainObject(current[key])) {
      current[key] = {}
    }
    current = current[key]
  }
  current[keys[keys.length - 1]] = value
}

export default function updateObject(target, ...sources) {
  if (!target || typeof target !== 'object') {
    target = {}
  }

  for (const source of sources) {
    if (!source || typeof source !== 'object') continue

    for (const key of Object.keys(source)) {
      const val = source[key]

      if (key.includes('.')) {
        // Dot notation support
        setNestedProperty(target, key, val)
      } else if (isPlainObject(val)) {
        if (!target[key] || !isPlainObject(target[key])) {
          target[key] = {}
        }
        updateObject(target[key], val)
      } else {
        target[key] = val
      }
    }
  }

  return target
}
