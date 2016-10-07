import t from 'tcomb'
import { Behavior, Identity } from '../types'

export const stateType = t.dict(Identity, Behavior, 'BehaviorDictionary')

export const initialState = {}

export const actions = {
	addBehavior: Behavior,
	removeBehavior: Identity,
	updateBehavior: t.interface({
		id: Identity,
		property: t.String,
		value: t.Any,
	}),
	replaceBehaviors: stateType,
}

export const reducers = {
	addBehavior(state, { payload: behavior }) {
		return t.update(state, {
			[behavior.id]: { $set: behavior },
		})
	},
	removeBehavior(state, { payload: behaviorId }) {
		return t.update(state, {
			$remove: [behaviorId],
		})
	},
	updateBehavior(state, { payload: { id, property, value }}) {
		return t.update(state, {
			[id]: { [property]: { $set: value }},
		})
	},
	replaceBehaviors(state, { payload: behaviors }) {
		return { ...behaviors }
	},
}
