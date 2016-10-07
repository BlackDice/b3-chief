import test from 'ava'
import { behaviorsFixture } from '../fixture'

import Store from '../../src/Store'

test.beforeEach((t) => {
	t.context.store = Store.create({ preloadedState: behaviorsFixture() }).store
	t.context.selectAll = t.context.store.select((state) => state.behaviors)
	t.context.selectOne = t.context.store.select((state, id) => state.behaviors[id])
})

test('addBehavior sets passed behavior to state by id', (t) => {
	const { store, selectAll } = t.context
	store.actions.addBehavior({
		id: 'test',
		name: 'TestBehavior',
		type: 'LEAF',
		definition: 'tick(){}',
	})
	const behaviors = selectAll()
	t.truthy(behaviors.test)
	t.is(behaviors.test.name, 'TestBehavior')
})

test('removeBehavior clears behavior by id from state', (t) => {
	const { store, selectAll } = t.context
	store.actions.removeBehavior('LeafBehavior')
	const behaviors = selectAll()
	t.falsy(behaviors.LeafBehavior)
})

test('updateBehavior can change properties of behavior', (t) => {
	const { store, selectOne } = t.context
	store.actions.updateBehavior({
		id: 'LeafBehavior',
		property: 'name',
		value: 'NewName',
	})
	store.actions.updateBehavior({
		id: 'LeafBehavior',
		property: 'type',
		value: 'COMPOSITE',
	})
	const behavior = selectOne('LeafBehavior')
	t.is(behavior.name, 'NewName')
	t.is(behavior.type, 'COMPOSITE')
})

test('replaceBehaviors uses passed list of behaviors instead of existing one', (t) => {
	const { store, selectAll } = t.context
	const behaviors = {
		NewBehavior: {
			id: 'NewBehavior',
			name: 'Replaced behavior',
			type: 'DECORATOR',
			definition: `{
				tick({ status }) {
					return status.FAILURE
				},
			}`,
		},
	}
	store.actions.replaceBehaviors(behaviors)
	const stateBehaviors = selectAll()
	t.is(Object.keys(stateBehaviors).length, 1)
	t.truthy(stateBehaviors.NewBehavior)
})
