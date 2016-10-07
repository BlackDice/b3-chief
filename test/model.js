import { test } from 'ava'

import { methods } from 'stampit'
import tcomb from 'tcomb'

import Model from '../src/core/Model'

const TestType = tcomb.interface({
	id: tcomb.maybe(tcomb.Number),
	alpha: tcomb.maybe(tcomb.String),
	beta: tcomb.maybe(tcomb.Boolean),
}, 'Test')

const testData = {
	id: 10, alpha: 'foo', beta: true,
}

function initDataSource() {
	this.dataSource = () => testData
}

test('creates model with getters and setters by specified type', (t) => {
	const model = Model(TestType).create()

	t.true(tcomb.Function.is(model.getAlpha))
	t.true(tcomb.Function.is(model.getBeta))

	t.true(tcomb.Function.is(model.setAlpha))
	t.true(tcomb.Function.is(model.setBeta))
})

test('the `id` property is read only by default', (t) => {
	const model = Model(TestType).create()
	t.false(tcomb.Function.is(model.setId))
})

test('getter reads data using dataSource property set on model', (t) => {
	const model = Model(TestType).init(initDataSource).create()
	t.is(model.getId(), 10)
	t.is(model.getAlpha(), 'foo')
	t.is(model.getBeta(), true)
})

test('getter uses adapter.get method', (t) => {
	const Adapter = methods({
		get() { return 50 },
	})
	const model = Model(TestType, Adapter).init(initDataSource).create()
	t.is(model.getId(), 50)
})

test('getter uses adapter.get[Name] method instead of adapter.get', (t) => {
	const Adapter = methods({
		getAlpha(dataSource) { return dataSource().alpha },
		getBeta() { return this.getId() },
	})
	const model = Model(TestType, Adapter).init(initDataSource).create(testData)
	t.is(model.getAlpha(), 'foo')
	t.is(model.getBeta(), 10)
})

test('setter needs to be defined on adapter', (t) => {
	const model = Model(TestType).create()
	t.throws(() => model.setAlpha('test'), /no setter has been defined/i)
})

test('setter uses adapter.set method', (t) => {
	t.plan(2)
	const Adapter = methods({
		set(name, value) {
			t.is(name, 'alpha')
			t.is(value, 'test')
		},
	})
	const model = Model(TestType, Adapter).create()
	model.setAlpha('test')
})

test('setter uses adapter.set[Name] if defined along with adapter.set', (t) => {
	t.plan(3)
	const Adapter = methods({
		set(name, value) {
			t.is(name, 'beta')
			t.is(value, false)
		},
		setBeta(value) {
			t.is(value, false)
		},
	})
	const model = Model(TestType, Adapter).create()
	model.setBeta(false)
})

test('valueOf method returns content of data source', (t) => {
	const model = Model(TestType).init(initDataSource).create(testData)
	t.deepEqual(model.valueOf(), testData)
})

test('getModelName method returns name of model type', (t) => {
	const model = Model(TestType).create()
	t.is(model.getModelName(), 'Test')
})

test('toString() contains name of model type', (t) => {
	const model = Model(TestType).create()
	t.true(model.toString().includes('Test'))
})
