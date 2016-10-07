import { test } from 'ava'

import Chief from './_chief'

const BEHAVIOR_TYPE = Chief.BEHAVIOR_TYPE

test('hasBehaviorName() checks if behavior is present', (t) => {
	const { instance } = t.context
	t.true(instance.hasBehaviorName('Sequence'))
	t.false(instance.hasBehaviorName('TEST'))
	instance.createBehavior('TEST')
	t.true(instance.hasBehaviorName('TEST'))
})

test('createBehavior() expects unique behavior name specified', (t) => {
	const { instance } = t.context
	t.throws(() => instance.createBehavior(), /name of behavior/)
	instance.createBehavior('TEST')
	t.throws(() => instance.createBehavior('TEST'), /has to be unique/)
})

test('createBehavior() expects valid behavior type', (t) => {
	const { instance } = t.context
	t.throws(() => instance.createBehavior('TEST', 'foo'), /Invalid value.*Behavior\/type/)
})

test('createBehavior() returns behavior model with specified name and type', (t) => {
	const { instance } = t.context
	const actual = instance.createBehavior('TEST', BEHAVIOR_TYPE.COMPOSITE)
	t.truthy(actual)
	t.is(actual.getName(), 'TEST')
	t.is(actual.getType(), BEHAVIOR_TYPE.COMPOSITE)
})

test('createBehavior() returned behavior model has isNative set to false', (t) => {
	const { instance } = t.context
	const actual = instance.createBehavior('TEST')
	t.false(actual.isNative)
})

test('createBehavior() adds created behavior to the list', (t) => {
	const { instance } = t.context
	const behaviorCount = instance.behaviorCount
	instance.createBehavior('TEST')
	t.is(instance.behaviorCount, behaviorCount + 1)
})

test('getBehavior() returns behavior model by ID', (t) => {
	const { instance } = t.context
	t.is(instance.getBehavior('unknown'), null)

	const expected = instance.createBehavior('TEST')
	const actual = instance.getBehavior(expected.getId())

	t.is(actual.getId(), expected.getId())
})

test('getBehavior() returns native behavior by ID', (t) => {
	const { instance } = t.context
	const actual = instance.getBehavior('Native-Succeeder')
	t.is(actual.getId(), 'Native-Succeeder')
})

test('destroyBehavior() removes behavior from list and disposes it', (t) => {
	const { instance } = t.context

	const actual = instance.createBehavior('TEST')
	const id = actual.getId()

	instance.destroyBehavior(id)
	t.is(instance.getBehavior(id), null)
})

test('listBehaviors() returns array of behaviors', (t) => {
	const { instance } = t.context
	const behavior = instance.createBehavior('TEST')
	const actual = instance.listBehaviors()
	t.true(Array.isArray(actual))
	t.truthy(actual.find((item) => item.getName() === 'Succeeder'))
	t.is(actual.find((item) => item.getName() === 'TEST').getId(), behavior.getId())
})
