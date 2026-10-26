import { describe, it, expect, beforeEach } from 'vitest'
import './setup'
import Localbase from '../localbase/localbase'

describe('Query Engine & Comparison Operators (Issues #86, #28, #15, #25)', () => {
  let db

  beforeEach(async () => {
    db = new Localbase(`test_query_${Date.now()}_${Math.random()}`)
    db.config.debug = false

    // Populate dataset
    await db.collection('users').add({ name: 'Alice', age: 25, role: 'developer', tags: ['js', 'vue'], score: 85, profile: { city: 'SP' } })
    await db.collection('users').add({ name: 'Bob', age: 17, role: 'intern', tags: ['python'], score: 60, profile: { city: 'RJ' } })
    await db.collection('users').add({ name: 'Charlie', age: 34, role: 'developer', tags: ['js', 'react'], score: 95, profile: { city: 'SP' } })
    await db.collection('users').add({ name: 'Diana', age: 29, role: 'manager', tags: ['agile'], score: 70, profile: { city: 'BH' } })
    await db.collection('users').add({ name: 'Evan', age: 2, role: 'mascot', tags: [], score: 10, profile: { city: 'SP' } })
    await db.collection('users').add({ name: 'Frank', age: 10, role: 'junior', tags: ['css'], score: 40, profile: { city: 'PR' } })
  })

  it('supports comparison operators: > and >=', async () => {
    const adults = await db.collection('users').where('age', '>=', 18).get()
    expect(adults.length).toBe(3) // Alice (25), Charlie (34), Diana (29)

    const seniors = await db.collection('users').where('age', '>', 29).get()
    expect(seniors.length).toBe(1)
    expect(seniors[0].name).toBe('Charlie')
  })

  it('supports comparison operators: < and <=', async () => {
    const minors = await db.collection('users').where('age', '<', 18).get()
    expect(minors.length).toBe(3) // Bob (17), Evan (2), Frank (10)

    const youths = await db.collection('users').where('age', '<=', 10).get()
    expect(youths.length).toBe(2) // Evan (2), Frank (10)
  })

  it('supports "in" and "not-in" operators', async () => {
    const devsAndManagers = await db.collection('users').where('role', 'in', ['developer', 'manager']).get()
    expect(devsAndManagers.length).toBe(3)

    const others = await db.collection('users').where('role', 'not-in', ['developer', 'manager']).get()
    expect(others.length).toBe(3)
  })

  it('supports "array-contains" operator', async () => {
    const jsUsers = await db.collection('users').where('tags', 'array-contains', 'js').get()
    expect(jsUsers.length).toBe(2)
    const names = jsUsers.map(u => u.name).sort()
    expect(names).toEqual(['Alice', 'Charlie'])
  })

  it('supports "between" operator', async () => {
    const midScores = await db.collection('users').where('score', 'between', [60, 85]).get()
    expect(midScores.length).toBe(3) // Bob (60), Diana (70), Alice (85)
  })

  it('supports nested dot-notation paths', async () => {
    const spUsers = await db.collection('users').where('profile.city', '==', 'SP').get()
    expect(spUsers.length).toBe(3) // Alice, Charlie, Evan
  })

  it('correctly sorts numbers numerically (not alphabetically)', async () => {
    // Ages are [25, 17, 34, 29, 2, 10]
    // Alphabetical sort would give: [10, 17, 2, 25, 29, 34] (2 after 17!)
    // Numerical sort must give: [2, 10, 17, 25, 29, 34]
    const sorted = await db.collection('users').orderBy('age', 'asc').get()
    const ages = sorted.map(u => u.age)
    expect(ages).toEqual([2, 10, 17, 25, 29, 34])
  })

  it('supports multi-field orderBy (Issue #15)', async () => {
    // Sort by role asc, then age desc
    const sorted = await db.collection('users')
      .orderBy('role', 'asc')
      .orderBy('age', 'desc')
      .get()

    // developers should be Charlie (34), then Alice (25)
    const devs = sorted.filter(u => u.role === 'developer')
    expect(devs[0].name).toBe('Charlie')
    expect(devs[1].name).toBe('Alice')
  })

  it('retrieves all matching items in collection query (Issue #25)', async () => {
    await db.collection('skus').add({ type: 'LONGBOARD', sku: 'SKU-1' })
    await db.collection('skus').add({ type: 'LONGBOARD', sku: 'SKU-2' })
    await db.collection('skus').add({ type: 'SHORTBOARD', sku: 'SKU-3' })

    const longboards = await db.collection('skus').where('type', '==', 'LONGBOARD').get()
    expect(longboards.length).toBe(2)
  })
})
