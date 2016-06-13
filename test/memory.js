import { test } from 'ava';

import Memory from '../src/core/Memory';

test.beforeEach((t) => {
	t.context.withDefaults = Memory.withDefaults({ test: 'default', falsy: 0 });
});

test('get() is expecting string key to be retrieved from memory', (t) => {
	const memory = Memory.create();
	t.throws(() => memory.get(), /expecting string key/);
});

test('get() returns null if no data are associated with such key', (t) => {
	const memory = Memory.create();
	t.is(memory.get('test'), null);
});

test('get() returns default value specified in deep configuration of stamp', (t) => {
	const { withDefaults } = t.context;
	const memory = withDefaults.create();
	t.is(memory.get('test'), 'default');
	t.is(memory.get('falsy'), 0);
});

test('get() returns value passed in options object when constructing memory', (t) => {
	const { withDefaults } = t.context;
	const memory = withDefaults.create({ test: 'foo' });
	t.is(memory.get('test'), 'foo');
	t.is(memory.get('falsy'), 0);
});

test('get() returns and stores return value of function used in defaults', (t) => {
	const memory = Memory.withDefaults({
		test() { return []; },
	}).create();
	const array = memory.get('test');
	array.push('foo');
	t.is(memory.get('test'), array);
});

test('get() returns same reference of object used in defaults across instances', (t) => {
	const defaultArray = ['foo'];
	const defaultObject = { defaultArray };
	const withDefaults = Memory.withDefaults({ defaultArray, defaultObject });

	const memory1 = withDefaults.create();
	t.not(memory1.get('defaultArray'), defaultArray);
	t.not(memory1.get('defaultObject'), defaultObject);

	const memory2 = withDefaults.create();
	t.is(memory2.get('defaultArray'), memory1.get('defaultArray'));
});

test('set() changes value of memory having priority over anything else', (t) => {
	const { withDefaults } = t.context;
	const memory = withDefaults.create({ test: 'foo' });
	memory.set('test', 'bar');
	t.is(memory.get('test'), 'bar');
});

test('set() emits `change` event with key, value and previousValue', (t) => {
	const memory = Memory.create();
	memory.set('test', 'foo');
	memory.on('change', ({ key, value, previousValue }) => {
		t.is(key, 'test');
		t.is(value, 'bar');
		t.is(previousValue, 'foo');
	});
	t.plan(3);
	memory.set('test', 'bar');
});

test('dump() returns clone of passed data mixed with changed values but no defaults', (t) => {
	const { withDefaults } = t.context;
	const memory = withDefaults.create({ passed: 'data', setdata: false });
	memory.set('setdata', true);
	memory.set('extra', 0);
	t.deepEqual(memory.dump(), {
		passed: 'data',
		setdata: true,
		extra: 0,
	});
});

test('forget() clears all set keys but keeps data passed in and defaults', (t) => {
	const { withDefaults } = t.context;
	const memory = withDefaults.create({ passed: 'data' });
	memory.set('passed', 'changed');
	memory.forget();
	t.is(memory.get('passed'), 'data');
	t.is(memory.get('test'), 'default');
});

test.beforeEach((t) => {
	t.context.withSubmemory = Memory.withSubmemory('test', t.context.withDefaults);
});

test('to access submemory string identifier needs to be specified', (t) => {
	const { withSubmemory } = t.context;
	const memory = withSubmemory.create();
	t.throws(() => memory.accessTest(), /requires string identifier/);
});

test('accessed submemory with same identifier is identical', (t) => {
	const { withSubmemory } = t.context;
	const memory = withSubmemory.create();
	const expected = memory.accessTest('foo');
	t.is(memory.accessTest('foo'), expected);
});

test('accessed submemory has interface like regular memory', (t) => {
	const { withSubmemory } = t.context;
	const memory = withSubmemory.create();
	const submemory = memory.accessTest('foo');
	t.is(typeof submemory.get, 'function');
	t.is(typeof submemory.set, 'function');
	t.is(typeof submemory.dump, 'function');
	t.is(typeof submemory.forget, 'function');
	t.is(submemory.get('test'), 'default');
});

test('submemory can be forgot manually', (t) => {
	const { withSubmemory } = t.context;
	const memory = withSubmemory.create();
	const submemory = memory.accessTest('foo');
	submemory.set('test', 'forgettable');
	memory.forgetTest();
	const remember = memory.accessTest('foo');
	t.not(submemory, remember);
	t.not(remember.get('test'), 'forgettable');
});

test('submemory can is forgotten when parent memory is forgot', (t) => {
	const { withSubmemory } = t.context;
	const memory = withSubmemory.create();
	const submemory = memory.accessTest('foo');
	submemory.set('test', 'forgettable');
	memory.forget();
	const remember = memory.accessTest('foo');
	t.not(submemory, remember);
	t.not(remember.get('test'), 'forgettable');
});

test('list of identifiers for submemory can be retrieved', (t) => {
	const { withSubmemory } = t.context;
	const memory = withSubmemory.create();
	memory.accessTest('foo');
	memory.accessTest('bar');
	memory.accessTest('baz');
	t.deepEqual(memory.listTest(), ['foo', 'bar', 'baz']);
});
