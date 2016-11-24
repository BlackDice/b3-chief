import { test } from 'ava'

import './_chief'

test('getSubjectMemory() returns memory of a subject', (t) => {
	const { instance } = t.context
	const subject = instance.getSubject('TestBetaSubject')
	const expected = {
		number: 10,
		string: 'foo',
		boolean: true,
		array: [20, 'bar', false],
		object: {
			key: 'value',
		},
	}
	const memory = subject.getSubjectMemory()
	t.is(memory.memoryId, 'TestBetaSubject')
	const actual = memory.get()
	t.deepEqual(actual, expected)
})

test('getTreeMemory() returns memory of a subject for tree', (t) => {
	const { instance } = t.context
	const subject = instance.getSubject('TestAlphaSubject')
	const memory = subject.getTreeMemory('TestTree')
	t.is(memory.memoryId, 'TestTree')
	memory.set('test', 'foo')
	t.is(memory.get('test'), 'foo')
})

test('getNodeMemory() returns memory of a subject for tree', (t) => {
	const { instance } = t.context
	const subject = instance.getSubject('TestAlphaSubject')
	const memory = subject.getNodeMemory('TestNode', 'TestTree')
	t.is(memory.memoryId, 'TestTree_TestNode')
	memory.set('test', 'foo')
	t.is(memory.get('test'), 'foo')
})
