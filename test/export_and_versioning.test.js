import { describe, it, expect, beforeEach } from 'vitest'
import './setup'
import Localbase from '../localbase/localbase'

describe('Multi-Collection Isolation, Export/Import & Versioning (Issues #20, #30, #68)', () => {
  let db

  beforeEach(() => {
    db = new Localbase(`test_export_${Date.now()}_${Math.random()}`)
    db.config.debug = false
  })

  it('prevents docSelectionCriteria leak when querying multiple collections with own keys (Issue #20)', async () => {
    // Exact reproduction snippet from Issue #20
    await db.collection('users').add({ id: 1, name: 'Bill', age: 47 }, 'mykey-1')
    await db.collection('users').doc('mykey-2').set({ id: 2, name: 'Paul', age: 34 })
    await db.collection('cars').doc('mykey-3').add({ id: 1, name: 'Honda' })

    const users = await db.collection('users').get()
    const cars = await db.collection('cars').get()

    expect(Array.isArray(users)).toBe(true)
    expect(users.length).toBe(2)
    expect(Array.isArray(cars)).toBe(true)
    expect(cars.length).toBe(1)
    expect(cars[0].name).toBe('Honda')
  })

  it('exports collection as JSON and CSV (Issue #30)', async () => {
    await db.collection('employees').add({ id: 101, name: 'Alice', role: 'Dev' }, 'emp-1')
    await db.collection('employees').add({ id: 102, name: 'Bob', role: 'Designer' }, 'emp-2')

    // JSON export
    const jsonStr = await db.collection('employees').export({ format: 'json' })
    const parsed = JSON.parse(jsonStr)
    expect(parsed.length).toBe(2)

    // CSV export
    const csvStr = await db.collection('employees').export({ format: 'csv' })
    expect(csvStr).toContain('name,role')
    expect(csvStr).toContain('Alice')
    expect(csvStr).toContain('Bob')
  })

  it('imports data into collection and restores documents (Issue #30)', async () => {
    const backup = [
      { id: 201, product: 'Keyboard', price: 99 },
      { id: 202, product: 'Monitor', price: 299 }
    ]

    await db.collection('inventory').import(backup)

    const items = await db.collection('inventory').get()
    expect(items.length).toBe(2)
    const names = items.map(i => i.product).sort()
    expect(names).toEqual(['Keyboard', 'Monitor'])
  })

  it('manages database schema versioning and applies migrations (Issue #68)', async () => {
    await db.collection('profiles').doc('u1').set({ firstName: 'Danny', lastName: 'Connell' })

    const initialVersion = await db.getVersion()
    expect(initialVersion).toBe(1)

    // Run migration to v2
    await db.version(2, async (migrator) => {
      const user = await migrator.collection('profiles').doc('u1').get()
      await migrator.collection('profiles').doc('u1').update({
        fullName: `${user.firstName} ${user.lastName}`
      })
    })

    const updatedUser = await db.collection('profiles').doc('u1').get()
    expect(updatedUser.fullName).toBe('Danny Connell')

    const newVersion = await db.getVersion()
    expect(newVersion).toBe(2)

    // Running again with same target version should not re-run migration
    let migrationRun = false
    await db.version(2, async () => {
      migrationRun = true
    })
    expect(migrationRun).toBe(false)
  })
})
