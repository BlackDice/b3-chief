import t from 'tcomb'
import { Subject, Identity, Memory, MemoryKey, MemoryValue, MemoryDictionary } from '../types'

export const stateType = t.dict(Identity, Subject, 'SubjectDictionary')

export const initialState = {}

export const actions = {
	addSubject: Subject,
	removeSubject: Identity,
	updateSubject: t.interface({
		id: Identity,
		property: t.String,
		value: t.Any,
	}),
	replaceSubjects: stateType,
	setMemory: t.interface({
		subjectId: Identity,
		memoryId: Identity,
		key: MemoryKey,
		value: MemoryValue,
	}),
	removeMemory: t.interface({
		subjectId: Identity,
		memoryId: Identity,
	}),
}

export const reducers = {
	addSubject(state, { payload: subject }) {
		return t.update(state, {
			[subject.id]: { $set: subject },
		})
	},
	removeSubject(state, { payload: subjectId }) {
		return t.update(state, {
			$remove: [subjectId],
		})
	},
	updateSubject(state, { payload: { id, property, value }}) {
		return t.update(state, {
			[id]: { [property]: { $set: value }},
		})
	},
	replaceSubjects(state, { payload: subjects }) {
		return { ...subjects }
	},
	setMemory(state, { payload: { subjectId, memoryId, key, value }}) {
		return t.update(state, {
			[subjectId]: { $apply: (subject) => (
				applySubjectMemory(subject, memoryId, key, value)
			) },
		})
	},
	removeMemory(state, { payload: { subjectId, memoryId }}) {
		if (state[subjectId] && state[subjectId].memories) {
			return t.update(state, {
				[subjectId]: { memories: {
					$remove: [memoryId],
				}},
			})
		}
		return state
	},
}

function applySubjectMemory(subject, memoryId, key, value) {
	let result = subject

	if (MemoryDictionary.is(subject.memories) === false) {
		result = t.update(result, {
			memories: {
				$set: {},
			},
		})
	}

	if (Memory.is(result.memories[memoryId]) === false) {
		result = t.update(result, {
			memories: {
				[memoryId]: {
					$set: {},
				},
			},
		})
	}

	return t.update(result, {
		memories: {
			[memoryId]: {
				$merge: {
					[key]: value,
				},
			},
		},
	})
}

export const applyForSelectors = (selectors) => ({
	...selectors,
	subjects: (state) => state.subjects,
	memory: (state, subjectId, memoryId) => {
		const { memories } = state.subjects[subjectId]
		if (t.Nil.is(memories)) {
			return null
		}
		return memories[memoryId] || null
	},
})
