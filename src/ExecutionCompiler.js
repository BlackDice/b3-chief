import t from 'tcomb'
import ObjectCache from './core/ObjectCache'

import { Compilation } from './types'

export default function createExecutionCompiler({ compiler, onError }) {
	const compileBehavior = (behavior) => (
		compiler(
			wrapDefinition(behavior.getDefinition())
		, onError)
	)

	const executionCompiler = (behavior) => (
		finishCompilation(
			t.Function.is(behavior.getCompilation)
				? behavior.getCompilation()
				: compileBehavior(behavior)
			, behavior, onError
		)
	)

	return ObjectCache(executionCompiler, (behavior) => behavior.getId())
}

const emptyLifecycleMethod = () => {}
const initialCompilation = {
	onEnter: emptyLifecycleMethod,
	onOpen: emptyLifecycleMethod,
	onClose: emptyLifecycleMethod,
	onExit: emptyLifecycleMethod,
}

function wrapDefinition(behavior) {
	return `
		'use strict';
		var compiled = ${behavior.getDefinition()};
		compiled;
	`
}

function finishCompilation(compilation, behavior, onError) {
	return validateCompilation(
		sanitizeCompilation(compilation, behavior)
	, onError)
}

function validateCompilation(compilation, onError) {
	try {
		return Compilation(compilation)
	} catch (err) {
		onError(err, 'invalid compilation for behavior %s', compilation.behavior)
		return compilation
	}
}

function sanitizeCompilation(compilation, behavior) {
	return Object.freeze({
		...initialCompilation,
		...compilation,
		behavior: behavior.toString(),
	})
}

