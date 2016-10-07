import { test } from 'ava'

import './_chief'

test('createSubject() is expecting tree ID', (t) => {
	const { instance } = t.context
	t.throws(() => instance.createSubject(), /is expecting tree/)
})

test('createSubject() creates a new subject with unique ID', (t) => {
	const { instance } = t.context

	const firstSubject = instance.createSubject('TestTree')
	t.truthy(firstSubject)
	t.truthy(firstSubject.getId())
	t.is(firstSubject.getTreeId(), 'TestTree')

	const secondSubject = instance.createSubject('TestTree')
	t.not(firstSubject.getId(), secondSubject.getId())
})

test('createSubject() accepts target as second optional argument', (t) => {
	const { instance } = t.context

	const subject = instance.createSubject('TestTree', 'TestTarget')
	t.is(subject.getTarget(), 'TestTarget')
})

test('hasSubject() checks if subject by specified ID is present', (t) => {
	const { instance } = t.context
	t.true(instance.hasSubject('TestAlphaSubject'))
	t.false(instance.hasSubject('UnknownSubject'))
})

test('getSubject() returns subject by ID', (t) => {
	const { instance } = t.context
	const actual = instance.getSubject('TestAlphaSubject')
	t.is(actual.getId(), 'TestAlphaSubject')
	t.is(instance.getSubject('UnknownSubject'), null, 'should return null for non-existing subject')
})

test('listSubjects() returns all existing subjects', (t) => {
	const { instance } = t.context
	const subjectCount = instance.subjectCount

	const firstSubject = instance.createSubject('TestTree')
	t.is(Array.from(instance.listSubjects()).length, subjectCount + 1, 'one subject')

	const secondSubject = instance.createSubject('TestTree')

	const subjects = Array.from(instance.listSubjects())
	t.is(subjects.length, subjectCount + 2, 'two subject')
	t.is(subjects[subjectCount + 0].getId(), firstSubject.getId())
	t.is(subjects[subjectCount + 1].getId(), secondSubject.getId())
})

test('listSubjects() returns subjects having specified tree as active one', (t) => {
	const { instance } = t.context
	const secondTree = instance.createTree('Second tree')

	const subject = instance.createSubject(secondTree)

	t.is(instance.listSubjects('EmptyTree').length, 3)
	t.is(instance.listSubjects(secondTree).length, 1)
	t.is(instance.listSubjects(secondTree)[0].getId(), subject.getId())
})

test('destroySubject() removes subject by ID', (t) => {
	const { instance } = t.context
	instance.destroySubject('TestGamaSubject')
	t.false(instance.hasSubject('TestGamaSubject'))
})
