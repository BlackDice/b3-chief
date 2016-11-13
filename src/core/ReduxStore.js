import t from 'tcomb'
import { createStore, compose, applyMiddleware, combineReducers, bindActionCreators } from 'redux'
import { createCheckedMiddleware, createCheckedReducer } from 'redux-tcomb'

function initializeStore({ providerMap, preloadedState }) {
	const providers = prepareProviders(providerMap)
	const actionCreators = providers.reduce(applyForActionCreators, {})
	const reducerMap = providers.reduce(applyForReducer, {})
	const stateType = providers.reduce(applyForStateType, t.interface({}))

	const store = setupStore({
		preloadedState,
		actionType: createActionType(actionCreators),
		reducer: createCheckedReducer(
			combineReducers(reducerMap), stateType,
		),
	})

	return {
		actions: bindActionCreators(actionCreators, store.dispatch),
		selectors: providers.reduce(applyForSelectors, {}),
		select: (selector) => (
			(...args) => selector(store.getState(), ...args)
		),
		observe: (selector, onChange) => observeStore(store, selector, onChange),
	}
}

function prepareProviders(providerMap) {
	return Object.keys(providerMap).map((name) => ({
		name, ...providerMap[name],
	}))
}

function applyForActionCreators(actionCreators, provider) {
	if (provider.applyForActionCreators) {
		return provider.applyForActionCreators(actionCreators)
	} else if (provider.actions) {
		return {
			...actionCreators,
			...buildActionCreators(provider),
		}
	}
	return actionCreators
}

function applyForReducer(reducerMap, provider) {
	if (provider.applyForReducer) {
		return provider.applyForReducer(reducerMap)
	} else if (provider.reducers) {
		return {
			...reducerMap,
			[provider.name]: buildReducer(provider),
		}
	}
	return reducerMap
}

function applyForStateType(stateType, provider) {
	if (provider.applyForStateType) {
		return provider.applyForStateType(stateType)
	} else if (provider.stateType) {
		return stateType.extend([{
			[provider.name]: t.maybe(provider.stateType),
		}])
	}
	return stateType
}

function applyForSelectors(selectors, provider) {
	if (provider.applyForSelectors) {
		return provider.applyForSelectors(selectors)
	}
	return {
		...selectors,
		[provider.name]: (state) => state[provider.name],
	}
}

function buildActionCreators({ actions }) {
	return Object.keys(actions).reduce((creators, type) => {
		const dispatchType = t.interface({
			type: t.enums.of(type),
			payload: actions[type],
		}, type)

		function actionCreator(x) {
			return { type, payload: x }
		}
		actionCreator.type = dispatchType
		actionCreator.displayName = type
		return { ...creators, [type]: actionCreator }
	}, {})
}

function buildReducer({ reducers, initialState }) {
	return function reducer(state = initialState, action) {
		const possibleReducer = reducers[action.type]
		if (t.Function.is(possibleReducer)) {
			return possibleReducer(state, action)
		}
		return state
	}
}

function createActionType(actionCreators) {
	const types = Object.keys(actionCreators).map((name) => actionCreators[name].type)
	if (types.length === 1) {
		return types[0]
	}

	const dispatchMap = types.reduce((map, type) => (
		{ ...map, [type.meta.name]: type }
	), {})

	const actionType = t.union(types, 'Action')
	actionType.dispatch = (x) => dispatchMap[x.type]
	return actionType
}

function setupStore({ actionType, reducer, preloadedState }) {
	const enhancer = createStoreEnhancer(
		createStoreMiddleware(actionType),
	)
	return createStore(reducer, preloadedState, enhancer)
}

function createStoreMiddleware(actionType) {
	return applyMiddleware(...[
		createCheckedMiddleware(actionType),
		createLoggerMiddleware(),
	].filter(t.Function.is))
}

function createStoreEnhancer(middleware) {
	const devTools = loadDevTools()
	if (t.Function.is(devTools)) {
		return compose(
			middleware, devTools(),
		)
	}
	return middleware
}

function loadDevTools() {
	try {
		return require('remote-redux-devtools') // eslint-disable-line
	} catch (err) {
		return null
	}
}

function createLoggerMiddleware() {
	if (process.env.NODE_ENV === 'development') {
		try {
			const createLogger = require('redux-node-logger') // eslint-disable-line
			return createLogger()
		} catch (err) {
			return null
		}
	}
	return null
}

function observeStore(store, select, onChange) {
	let currentState

	function handleChange() {
		const nextState = select(store.getState())
		if (nextState !== currentState) {
			currentState = nextState
			onChange(currentState)
		}
	}

	const unsubscribe = store.subscribe(handleChange)
	handleChange()
	return unsubscribe
}

export default initializeStore
