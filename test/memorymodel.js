import { test } from 'ava'

import './_chief'
import MemoryModel from '../src/MemoryModel'

test.beforeEach((t) => {
	t.context.getMemory = (subjectId, memoryId = subjectId) => (
		MemoryModel({ store: t.context.instance.store, subjectId, memoryId })
	)
})

test('is expecting store instance when constructed', (t) => {
	t.throws(() => MemoryModel({
		subjectId: 'TestSubject',
		memoryId: 'TestMemory',
	}), /expecting store instance/)
})

test('is expecting subjectId when constructed', (t) => {
	const { instance: { store }} = t.context
	t.throws(() => MemoryModel({
		store, memoryId: 'Testmemory',
	}), /expecting subjectId/)
})

test('is expecting memoryId when constructed', (t) => {
	const { instance: { store }} = t.context
	t.throws(() => MemoryModel({
		store, subjectId: 'TestSubject',
	}), /expecting memoryId/)
})

test('get() returns whole memory data', (t) => {
	const { getMemory } = t.context
	const memory = getMemory('TestBetaSubject')
	const expected = {
		number: 10,
		string: 'foo',
		boolean: true,
	}
	const actual = memory.get()
	t.deepEqual(actual, expected)
})

test('get(key) returns value of the memory by key', (t) => {
	const { getMemory } = t.context
	const memory = getMemory('TestBetaSubject')
	const expected = 'foo'
	const actual = memory.get('string')
	t.is(actual, expected)
})

test('get(key) returns null for non-existing key', (t) => {
	const { getMemory } = t.context
	const memory = getMemory('TestGamaSubject')
	const expected = null
	const actual = memory.get('missing')
	t.is(actual, expected)
})

test('set() is expecting key to set', (t) => {
	const { getMemory } = t.context
	const memory = getMemory('TestBetaSubject')
	t.throws(() => memory.set(), /invalid value undefined/i)
})

test('set() sets the value of memory by key', (t) => {
	const { getMemory } = t.context
	const memory = getMemory('TestAlphaSubject')
	const expected = 'testValue'
	memory.set('testKey', expected)
	const actual = memory.get('testKey')
	t.is(actual, expected)
})

test('unset() removes value of memory by key', (t) => {
	const { getMemory } = t.context
	const memory = getMemory('TestBetaSubject')
	memory.unset('number')
	const actual = memory.get('number')
	t.is(actual, null)
})
