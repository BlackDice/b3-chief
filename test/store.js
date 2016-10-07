import test from 'ava'

import './_chief'
import stateFixture from './fixture'

test.beforeEach((t) => {
	t.context.state = stateFixture()
})

test('replaceState() dispatches replaceBehaviors', (t) => {
	const { instance, state } = t.context

	t.plan(1)
	instance.store.actions.replaceBehaviors = (actualBehaviors) => {
		t.is(actualBehaviors, state.behaviors)
	}
	instance.replaceState(state)
})

test('replaceState() dispatches replaceTrees', (t) => {
	const { instance, state } = t.context

	t.plan(1)
	instance.store.actions.replaceTrees = (actualTrees) => {
		t.is(actualTrees, state.trees)
	}
	instance.replaceState(state)
})

test('replaceState() dispatches replaceSubjects', (t) => {
	const { instance, state } = t.context

	t.plan(1)
	instance.store.actions.replaceSubjects = (actualSubjects) => {
		t.is(actualSubjects, state.subjects)
	}
	instance.replaceState(state)
})
