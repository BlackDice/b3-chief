import stampit from 'stampit'

import ReduxStore from './core/ReduxStore'
import providerMap from './providers'

const Store = stampit({
	init: initStore,
	methods: {
		replaceState,
	},
})

function initStore({ preloadedState }) {
	this.store = ReduxStore({ providerMap, preloadedState })
}

function replaceState({ behaviors, trees, subjects }) {
	this.store.actions.replaceBehaviors(behaviors || {})
	this.store.actions.replaceTrees(trees || {})
	this.store.actions.replaceSubjects(subjects || {})
}

export default Store
