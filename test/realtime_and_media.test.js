import { describe, it, expect, beforeEach } from 'vitest'
import './setup'
import Localbase from '../localbase/localbase'

describe('Real-Time Watcher (onSnapshot) & Media Storage (Issues #71, #48, #62, #36, #88)', () => {
  let db

  beforeEach(() => {
    db = new Localbase(`test_realtime_${Date.now()}_${Math.random()}`)
    db.config.debug = false
  })

  it('receives initial snapshot and live updates on collection mutations (Issue #71, #48)', async () => {
    await db.collection('messages').add({ text: 'Hello 1', room: 'general' })

    const snapshots = []
    const unsubscribe = db.collection('messages')
      .where('room', '==', 'general')
      .orderBy('text', 'asc')
      .onSnapshot((docs) => {
        snapshots.push(docs.map(d => d.text))
      })

    // Allow initial snapshot promise to resolve
    await new Promise(r => setTimeout(r, 20))
    expect(snapshots.length).toBe(1)
    expect(snapshots[0]).toEqual(['Hello 1'])

    // Add new message to trigger live update
    await db.collection('messages').add({ text: 'Hello 2', room: 'general' })
    await new Promise(r => setTimeout(r, 20))

    expect(snapshots.length).toBe(2)
    expect(snapshots[1]).toEqual(['Hello 1', 'Hello 2'])

    // Unsubscribe and verify no more updates
    unsubscribe()
    await db.collection('messages').add({ text: 'Hello 3', room: 'general' })
    await new Promise(r => setTimeout(r, 20))

    expect(snapshots.length).toBe(2) // Remained 2 because unsubscribed
  })

  it('watches a single document for changes (Issue #71)', async () => {
    await db.collection('profile').doc('user-1').set({ status: 'online', score: 10 })

    const statuses = []
    const unsub = db.collection('profile').doc('user-1').onSnapshot((doc) => {
      if (doc) statuses.push(doc.status)
    })

    await new Promise(r => setTimeout(r, 20))
    expect(statuses).toEqual(['online'])

    await db.collection('profile').doc('user-1').update({ status: 'away' })
    await new Promise(r => setTimeout(r, 20))

    expect(statuses).toEqual(['online', 'away'])
    unsub()
  })

  it('stores and retrieves binary ArrayBuffer data without errors (Issue #36, #88)', async () => {
    const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer // "Hello" in ASCII

    await db.collection('files').doc('hello.bin').set({
      filename: 'hello.bin',
      data: buffer,
      size: buffer.byteLength
    })

    const retrieved = await db.collection('files').doc('hello.bin').get()
    expect(retrieved.filename).toBe('hello.bin')
    expect(retrieved.size).toBe(5)
    expect(retrieved.data).toBeInstanceOf(ArrayBuffer)
    expect(new Uint8Array(retrieved.data)).toEqual(new Uint8Array([72, 101, 108, 108, 111]))
  })
})
