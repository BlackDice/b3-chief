import { test } from 'ava'

import './_chief'

test('getNativeBehavior() returns native behavior by id', (t) => {
	const { instance } = t.context
	const success = instance.getNativeBehavior('Native-Succeeder')
	t.truthy(success)
	t.is(success.getName(), 'Succeeder')
})

test('no property of native behavior can be changed', (t) => {
	const { instance } = t.context
	const error = instance.getNativeBehavior('Native-Error')
	t.throws(() => error.setName('Fail'), /cannot be changed/)
})

test('definition of native behavior cannot be read', (t) => {
	const { instance } = t.context
	const error = instance.getNativeBehavior('Native-Runner')
	t.throws(() => error.getDefinition(), /cannot be read/)
})

test('listNativeBehaviors() returns list of behavior models', (t) => {
	const { instance } = t.context
	const natives = instance.listNativeBehaviors()
	t.true(Array.isArray(natives))
	t.true(natives.length > 0)
})

test('isNative is set to true for each model', (t) => {
	const { instance } = t.context
	const natives = instance.listNativeBehaviors()
	t.true(natives.every((native) => native.isNative))
})

test('cannot be destroyed', (t) => {
	const { instance } = t.context
	const failer = instance.getNativeBehavior('Native-Failer')
	t.throws(() => failer.destroy(), /cannot be destroyed/)
})
