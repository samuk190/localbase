import { describe, it, expect, beforeEach } from 'vitest'
import './setup'
import Localbase from '../localbase/localbase'

describe('CRUD Enhancements: Upsert, Auto-Increment, Count, Paginate, Exists (Issues #10, #9, #50, #73, #14)', () => {
  let db

  beforeEach(() => {
    db = new Localbase(`test_crud_${Date.now()}_${Math.random()}`)
    db.config.debug = false
  })

  it('upserts new document when document does not exist (Issue #10)', async () => {
    await db.collection('settings').doc('theme').upsert({ mode: 'dark', fontSize: 14 })

    const doc = await db.collection('settings').doc('theme').get()
    expect(doc.mode).toBe('dark')
    expect(doc.fontSize).toBe(14)
  })

  it('upserts and merges existing document without deleting other fields (Issue #10)', async () => {
    await db.collection('settings').doc('theme').set({ mode: 'dark', fontSize: 14, highContrast: false })
    await db.collection('settings').doc('theme').upsert({ mode: 'light', fontSize: 16 })

    const doc = await db.collection('settings').doc('theme').get()
    expect(doc.mode).toBe('light')
    expect(doc.fontSize).toBe(16)
    expect(doc.highContrast).toBe(false)
  })

  it('upserts by search criteria (Issue #10)', async () => {
    await db.collection('users').doc({ email: 'john@doe.com' }).upsert({ name: 'John Doe', age: 30 })

    const user = await db.collection('users').doc({ email: 'john@doe.com' }).get()
    expect(user.name).toBe('John Doe')
    expect(user.email).toBe('john@doe.com')
  })

  it('generates sequential auto-incremented integer keys (Issue #9)', async () => {
    const res1 = await db.collection('orders', { autoIncrement: true }).add({ item: 'Laptop', price: 1200 })
    const res2 = await db.collection('orders', { autoIncrement: true }).add({ item: 'Mouse', price: 25 })
    const res3 = await db.collection('orders', { autoIncrement: true }).add({ item: 'Keyboard', price: 80 })

    expect(res1.data.key).toBe(1)
    expect(res2.data.key).toBe(2)
    expect(res3.data.key).toBe(3)

    const order2 = await db.collection('orders').doc(2).get()
    expect(order2.item).toBe('Mouse')
  })

  it('efficiently counts collection and filtered items (Issue #50)', async () => {
    await db.collection('customers').add({ name: 'Cust 1', status: 'active' })
    await db.collection('customers').add({ name: 'Cust 2', status: 'inactive' })
    await db.collection('customers').add({ name: 'Cust 3', status: 'active' })
    await db.collection('customers').add({ name: 'Cust 4', status: 'active' })

    const total = await db.collection('customers').count()
    expect(total).toBe(4)

    const activeTotal = await db.collection('customers').where('status', '==', 'active').count()
    expect(activeTotal).toBe(3)
  })

  it('paginates collection with exact structure requested in Issue #50', async () => {
    for (let i = 1; i <= 25; i++) {
      await db.collection('products').add({ id: i, name: `Product ${i}` })
    }

    const page1 = await db.collection('products')
      .orderBy('id', 'asc')
      .paginate({ page: 1, limit: 10 })

    expect(page1.total_rows).toBe(25)
    expect(page1.row_limit).toBe(10)
    expect(page1.total_page).toBe(3)
    expect(page1.current_page).toBe(1)
    expect(page1.rows.length).toBe(10)
    expect(page1.rows[0].id).toBe(1)

    const page3 = await db.collection('products')
      .orderBy('id', 'asc')
      .paginate({ page: 3, limit: 10 })

    expect(page3.current_page).toBe(3)
    expect(page3.rows.length).toBe(5)
    expect(page3.rows[4].id).toBe(25)
  })

  it('checks if document exists cleanly without throwing errors (Issue #73)', async () => {
    await db.collection('accounts').doc('acc_100').set({ balance: 500 })

    const existsTrue = await db.collection('accounts').doc('acc_100').exists()
    expect(existsTrue).toBe(true)

    const existsFalse = await db.collection('accounts').doc('acc_999').exists()
    expect(existsFalse).toBe(false)
  })

  it('returns keys along with doc criteria filter when keys: true (Issue #14)', async () => {
    await db.collection('cars').add({ model: 'Civic', brand: 'Honda' }, 'honda-civic-2022')

    const docWithKey = await db.collection('cars').doc({ model: 'Civic' }).get({ keys: true })
    expect(docWithKey.key).toBe('honda-civic-2022')
    expect(docWithKey.data.brand).toBe('Honda')
  })
})
