import { describe, it, expect, beforeEach } from 'vitest'
import './setup'
import Localbase from '../localbase/localbase'
import { generateKey } from '../localbase/utils/uuid'
import updateObject from '../localbase/utils/updateObject'

describe('UUID Generator', () => {
  it('generates valid non-empty unique keys', () => {
    const keys = new Set()
    for (let i = 0; i < 100; i++) {
      const key = generateKey()
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(10)
      keys.add(key)
    }
    expect(keys.size).toBe(100)
  })
})

describe('Deep updateObject utility', () => {
  it('merges nested properties without erasing sibling properties', () => {
    const target = {
      name: 'Sam',
      profile: {
        age: 25,
        city: 'SP',
        nested: { a: 1, b: 2 }
      }
    }

    const result = updateObject(target, {
      profile: {
        city: 'RJ',
        nested: { b: 99 }
      }
    })

    expect(result.name).toBe('Sam')
    expect(result.profile.age).toBe(25)
    expect(result.profile.city).toBe('RJ')
    expect(result.profile.nested.a).toBe(1)
    expect(result.profile.nested.b).toBe(99)
  })

  it('supports dot-notation updates', () => {
    const target = { user: { settings: { theme: 'dark', sound: true } } }
    updateObject(target, { 'user.settings.theme': 'light' })
    expect(target.user.settings.theme).toBe('light')
    expect(target.user.settings.sound).toBe(true)
  })
})

describe('Concurrency & Transactional Safety (Issue #47 & #24)', () => {
  let db

  beforeEach(() => {
    db = new Localbase(`test_db_${Date.now()}_${Math.random()}`)
    db.config.debug = false
  })

  it('prevents concurrent update clobbering on the same document (Issue #47)', async () => {
    // Initial document setup
    await db.collection('hey_yo').doc('human').set({
      id: 'human',
      age: 14,
      gender: 'male',
      height: '2.4m',
      location: 'USA'
    })

    // Simulate concurrent rapid updates without awaiting between them
    const p1 = db.collection('hey_yo').doc('human').update({ age: 16 })
    const p2 = db.collection('hey_yo').doc('human').update({ gender: 'female' })

    await Promise.all([p1, p2])

    const updated = await db.collection('hey_yo').doc('human').get()
    expect(updated.age).toBe(16)
    expect(updated.gender).toBe('female')
    expect(updated.height).toBe('2.4m')
    expect(updated.location).toBe('USA')
  })

  it('reliably deletes multiple documents using Promise.all (Issue #24)', async () => {
    await db.collection('items').add({ tag: 'del', value: 1 })
    await db.collection('items').add({ tag: 'del', value: 2 })
    await db.collection('items').add({ tag: 'del', value: 3 })
    await db.collection('items').add({ tag: 'keep', value: 4 })

    await db.collection('items').doc({ tag: 'del' }).delete()

    const remaining = await db.collection('items').get()
    expect(remaining.length).toBe(1)
    expect(remaining[0].tag).toBe('keep')
  })
})
