import { test } from 'ava';

import Model from '../src/core/Model';

test('getter() creates related get method', (t) => {
	const model = Model().getter('test').create({ test: 'foo' });
	t.is(typeof model.getTest, 'function');
	t.is(model.getTest(), 'foo');
});

test('property() creates related get & set method', (t) => {
	const model = Model().property('test').create();
	t.is(typeof model.getTest, 'function');
	t.is(typeof model.setTest, 'function');
	model.setTest('foo');
	t.is(model.getTest(), 'foo');
});

test('getter() accepts function as second argument used create initial value', (t) => {
	const getter = (data) => {
		t.deepEqual(data, { test: 'foo' });
		return data.test.toUpperCase();
	};
	const model = Model().getter('test', getter).create({ test: 'foo' });
	t.is(model.getTest(), 'FOO');
});

test('model instance `data` property returns immutable model data', (t) => {
	const model = Model().property('test').create();
	t.deepEqual(model.data, { test: null });
	model.data.test = 'fail';
	t.not(model.getTest(), 'fail');
	model.setTest('foo');
	t.is(model.data.test, 'foo');
});

test('getModelName() equals to name of model specified during composition', (t) => {
	const model = Model('Test').create();
	t.is(model.getModelName(), 'Test');
});

test('toString() contains name of model specified during composition', (t) => {
	const model = Model('Test').create();
	t.true(model.toString().indexOf('Test') > 0);
});
