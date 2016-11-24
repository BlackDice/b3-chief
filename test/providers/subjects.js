import test from 'ava'
import { subjectsFixture } from '../fixture'

import Store from '../../src/Store'

test.beforeEach((t) => {
	t.context.store = Store.create({ preloadedState: subjectsFixture() }).store
	t.context.selectAll = t.context.store.select((state) => state.subjects)
	t.context.selectOne = t.context.store.select((state, id) => state.subjects[id])
})

test('addSubject sets passed subject to state by id', (t) => {
	const { store, selectAll } = t.context
	store.actions.addSubject({
		id: 'TestSubject',
		treeId: 'TestTree',
		target: 'Moon',
	})
	const subjects = selectAll()
	t.truthy(subjects.TestSubject)
	t.is(subjects.TestSubject.treeId, 'TestTree')
	t.is(subjects.TestSubject.target, 'Moon')
})

test('removeSubject clears subject by id from state', (t) => {
	const { store, selectOne } = t.context
	t.truthy(selectOne('TestBetaSubject'))
	store.actions.removeSubject('TestBetaSubject')
	t.falsy(selectOne('TestBetaSubject'))
})

test('updateSubject can change properties of subject', (t) => {
	const { store, selectOne } = t.context
	store.actions.updateSubject({
		id: 'TestAlphaSubject',
		property: 'treeId',
		value: 'NewTree',
	})
	t.is(selectOne('TestAlphaSubject').treeId, 'NewTree')
	store.actions.updateSubject({
		id: 'TestBetaSubject',
		property: 'target',
		value: 'NewTarget',
	})
	t.is(selectOne('TestBetaSubject').target, 'NewTarget')
})

test('replaceSubjects uses passed list of subjects instead of existing one', (t) => {
	const { store, selectAll } = t.context
	const subjects = {
		NewSubject: {
			id: 'NewSubject',
			treeId: 'TestTree',
		},
	}
	store.actions.replaceSubjects(subjects)
	const stateSubjects = selectAll()
	t.is(Object.keys(stateSubjects).length, 1)
	t.truthy(stateSubjects.NewSubject)
	t.is(stateSubjects.NewSubject.treeId, 'TestTree')
})

test('setMemory sets subject memory by specified id', (t) => {
	const { store, selectOne } = t.context
	store.actions.setMemory({
		subjectId: 'TestAlphaSubject',
		memoryId: 'TestAlphaSubject',
		key: 'testKey',
		value: 'testValue',
	})
	store.actions.setMemory({
		subjectId: 'TestAlphaSubject',
		memoryId: 'OtherSubjectMemory',
		key: 'otherTestKey',
		value: 'otherTestValue',
	})

	const subject = selectOne('TestAlphaSubject')
	t.truthy(subject.memories)

	t.truthy(subject.memories.TestAlphaSubject)
	t.is(subject.memories.TestAlphaSubject.testKey, 'testValue')

	t.truthy(subject.memories.OtherSubjectMemory)
	t.is(subject.memories.OtherSubjectMemory.otherTestKey, 'otherTestValue')
})

test('unsetMemory clear subject memory by specified id', (t) => {
	const { store, selectOne } = t.context
	store.actions.setMemory({
		subjectId: 'TestAlphaSubject',
		memoryId: 'TestAlphaSubject',
		key: 'testKey',
		value: 'testValue',
	})
	store.actions.unsetMemory({
		subjectId: 'TestAlphaSubject',
		memoryId: 'TestAlphaSubject',
		key: 'testKey',
	})

	const subject = selectOne('TestAlphaSubject')
	t.truthy(subject.memories)

	t.truthy(subject.memories.TestAlphaSubject)
	t.falsy(subject.memories.TestAlphaSubject.testKey)
})

test('removeMemory clears specified memory of subject', (t) => {
	const { store, selectOne } = t.context
	store.actions.setMemory({
		subjectId: 'TestBetaSubject',
		memoryId: 'PreservedMemory',
		key: 'testKey',
		value: 'testValue',
	})
	store.actions.removeMemory({
		subjectId: 'TestBetaSubject',
		memoryId: 'TestBetaSubject',
	})
	const subject = selectOne('TestBetaSubject')
	t.truthy(subject.memories)
	t.falsy(subject.memories.TestBetaSubject)
	t.truthy(subject.memories.PreservedMemory)
	t.is(subject.memories.PreservedMemory.testKey, 'testValue')
})
