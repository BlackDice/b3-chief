import test from 'ava'

import './_chief'

import { ExecutionContext, ExecutionTick } from '../src/types'

test.beforeEach((t) => {
	const { instance, Chief } = t.context

	let counter = 0

	const behaviors = {}
	instance.getBehavior = (behaviorId) => (
		behaviors[behaviorId] || instance.getNativeBehavior(behaviorId)
	)

	t.context.addBehavior = (behavior) => {
		behaviors[behavior.getId()] = behavior
	}

	t.context.createBehaviorNode = (tree, compilation = {}, type) => {
		const correctCompilation = {
			tick: ({ status }) => status.SUCCESS,
			...compilation,
		}
		const behavior = instance.createBehavior(`Test${counter += 1}`, type)
		behavior.getCompilation = () => correctCompilation
		t.context.addBehavior(behavior)
		const node = tree.createNode(behavior.getId())
		return node
	}

	t.context.createNativeBehaviorNode = (tree, name) => tree.createNode(`Native-${name}`)

	t.context.createTreeWithRoot = (compilation, type) => {
		const tree = instance.createTree(`Tree #${counter += 1}`)
		const subject = instance.createSubject(tree)
		const node = t.context.createBehaviorNode(tree, compilation, type)
		tree.setRootNode(node)
		return { tree, subject, node }
	}
	t.context.execution = instance.planExecution(undefined)
	t.context.status = Chief.STATUS
	t.context.behaviorType = Chief.BEHAVIOR_TYPE
})

test('execution() returns ERROR status if subject has invalid tree', (t) => {
	const { instance, execution, status } = t.context

	const subject = instance.createSubject('TestTree')
	instance.destroyTree('TestTree')
	const actual = execution(subject)
	t.is(actual, status.ERROR)
})

test('execution() returns ERROR status if tree has no root', (t) => {
	const { instance, execution, status } = t.context

	const subject = instance.createSubject('EmptyTree')
	const actual = execution(subject)
	t.is(actual, status.ERROR)
})

test('execution() returns state of root node execution of tick method', (t) => {
	const { execution, status, createTreeWithRoot } = t.context

	const { subject } = createTreeWithRoot({
		tick() {
			return status.SUCCESS
		},
	})

	const actual = execution(subject)
	t.is(actual, status.SUCCESS)
})

test('execution() provides execution context and tick object to tick behavior method', (t) => {
	const { execution, createTreeWithRoot } = t.context

	t.plan(1)
	const { subject } = createTreeWithRoot({
		tick(context, tick) {
			ExecutionContext(context)
			t.true(ExecutionTick.is(tick))
			return context.status.SUCCESS
		},
	})

	execution(subject)
})

test('the node with decorator behavior can execute its child and get its status', (t) => {
	const { execution, behaviorType, status, createTreeWithRoot, createNativeBehaviorNode } = t.context // eslint-disable-line max-len

	const { subject, tree, node } = createTreeWithRoot({
		tick(context, { child }) {
			return child()
		},
	}, behaviorType.DECORATOR)

	tree.addNodeChild(node, createNativeBehaviorNode(tree, 'Succeeder'))

	const actual = execution(subject)
	t.is(actual, status.SUCCESS)
})

test('the node with composite behavior can execute its children and get their status', (t) => {
	const { execution, behaviorType, status, createTreeWithRoot, createNativeBehaviorNode } = t.context // eslint-disable-line max-len

	const { subject, tree, node } = createTreeWithRoot({
		tick(context, { children }) {
			return children.reduce((result, child) => child(), null)
		},
	}, behaviorType.COMPOSITE)

	tree.addNodeChild(node, createNativeBehaviorNode(tree, 'Runner'))
	tree.addNodeChild(node, createNativeBehaviorNode(tree, 'Failer'))
	tree.addNodeChild(node, createNativeBehaviorNode(tree, 'Succeeder'))

	const actual = execution(subject)
	t.is(actual, status.SUCCESS)
})

test('the node with subtree behavior can execute another tree by its id', (t) => {
	const { instance, execution, behaviorType, status, createTreeWithRoot, createBehaviorNode } = t.context  // eslint-disable-line max-len

	const subtree = instance.createTree('SubTree')
	subtree.setRootNode(createBehaviorNode(subtree))

	const { subject } = createTreeWithRoot({
		tick(context, { executeTree }) {
			t.pass()
			return executeTree(subtree.getId())
		},
	}, behaviorType.SUBTREE)

	t.plan(2)
	const actual = execution(subject)
	t.is(actual, status.SUCCESS)
})

test('lifecycle method onEnter is invoked whenever node is being executed', (t) => {
	const { execution, createTreeWithRoot } = t.context

	const { subject } = createTreeWithRoot({
		onEnter(context) {
			ExecutionContext(context)
			t.pass()
		},
	})

	t.plan(1)
	execution(subject)
})

test('runtime error in onEnter method is passed through onError callback', (t) => {
	const { instance, status, createTreeWithRoot } = t.context

	const expected = new Error('onEnter')

	const { subject } = createTreeWithRoot({
		onEnter() {
			throw expected
		},
	})

	const onError = (actual) => {
		t.is(actual, expected)
	}

	const execution = instance.planExecution(undefined, onError)

	t.plan(2)
	t.is(execution(subject), status.ERROR)
})

test('lifecycle method onOpen is invoked only if node was closed previous tick', (t) => {
	const { execution, createTreeWithRoot } = t.context

	const { subject } = createTreeWithRoot({
		onOpen(context) {
			ExecutionContext(context)
			t.pass()
		},
		tick({ status }) {
			return status.RUNNING
		},
	})

	t.plan(1)
	execution(subject)
	execution(subject)
})

test('runtime error in onOpen method is passed through onError callback', (t) => {
	const { instance, status, createTreeWithRoot } = t.context

	const expected = new Error('onOpen')

	const { subject } = createTreeWithRoot({
		onOpen() {
			throw expected
		},
	})

	const onError = (actual) => {
		t.is(actual, expected)
	}

	const execution = instance.planExecution(undefined, onError)

	t.plan(2)
	t.is(execution(subject), status.ERROR)
})

test('runtime error in onOpen still causes invocation of onExit method ', (t) => {
	const { execution, createTreeWithRoot } = t.context

	const { subject } = createTreeWithRoot({
		onOpen() {
			throw new Error()
		},
		onExit() {
			t.pass()
		},
	})

	t.plan(1)
	execution(subject)
})

test('runtime error in tick method is passed through onError callback', (t) => {
	const { instance, status, createTreeWithRoot } = t.context

	const expected = new Error('tick')

	const { subject } = createTreeWithRoot({
		tick() {
			throw expected
		},
	})

	const onError = (actual) => {
		t.is(actual, expected)
	}

	const execution = instance.planExecution(undefined, onError)

	t.plan(2)
	t.is(execution(subject), status.ERROR)
})

test('lifecycle method onClose is invoked only when tick status is not RUNNING', (t) => {
	const { execution, createTreeWithRoot } = t.context

	let ticked = false
	const { subject } = createTreeWithRoot({
		onClose(context) {
			ExecutionContext(context)
			t.pass()
		},
		onExit() {
			ticked = true
		},
		tick({ status }) {
			return ticked ? status.SUCCESS : status.RUNNING
		},
	})

	t.plan(1)
	execution(subject)
	execution(subject)
})

test('runtime error in onClose method is passed through onError callback', (t) => {
	const { instance, status, createTreeWithRoot } = t.context

	const expected = new Error('onClose')

	const { subject } = createTreeWithRoot({
		onClose() {
			throw expected
		},
	})

	const onError = (actual) => {
		t.is(actual, expected)
	}

	const execution = instance.planExecution(undefined, onError)

	t.plan(2)
	t.is(execution(subject), status.ERROR)
})

test('lifecycle method onExit is invoked always without need for specific status', (t) => {
	const { execution, createTreeWithRoot } = t.context

	const { subject } = createTreeWithRoot({
		onExit() {
			t.pass()
		},
		tick({ status }) {
			return status.RUNNING
		},
	})

	t.plan(1)
	execution(subject)
})

test('runtime error in onExit method is passed through onError callback', (t) => {
	const { instance, status, createTreeWithRoot } = t.context

	const expected = new Error('onExit')

	const { subject } = createTreeWithRoot({
		onExit() {
			throw expected
		},
	})

	const onError = (actual) => {
		t.is(actual, expected)
	}

	const execution = instance.planExecution(undefined, onError)

	t.plan(2)
	t.is(execution(subject), status.ERROR)
})

test('lifecycle methods are executed in correct order', (t) => {
	const { execution, createTreeWithRoot } = t.context

	let stage = 0
	const { subject } = createTreeWithRoot({
		onEnter() {
			t.is(stage, 0)
			stage = 1
		},
		onOpen() {
			t.is(stage, 1)
			stage = 2
		},
		tick({ status }) {
			t.is(stage, 2)
			stage = 3
			return status.SUCCESS
		},
		onClose() {
			t.is(stage, 3)
			stage = 4
		},
		onExit() {
			t.is(stage, 4)
			stage = 5
		},
	})

	execution(subject)
	t.is(stage, 5)
})

test('definition of behavior gets compiled before execution', (t) => {
	const { execution, instance, behaviorType, createTreeWithRoot } = t.context

	const definition = `{
		onEnter({ memory }) { memory.set('onEnter', true) },
		onOpen({ memory }) { memory.set('onOpen', true) },
		tick({ memory, status }) {
			memory.set('tick', true)
			return status.SUCCESS
		},
		onClose({ memory }) { memory.set('onClose', true) },
		onExit({ memory }) { memory.set('onExit', true) },
	}`

	const { subject, tree, node: rootNode } = createTreeWithRoot({
		tick(context, { child }) {
			return child()
		},
	}, behaviorType.DECORATOR)

	const behavior = instance.createBehavior('WithDefinition')
	behavior.setDefinition(definition)
	t.context.addBehavior(behavior)

	const node = tree.createNode(behavior.getId())
	tree.addNodeChild(rootNode, node)

	execution(subject)
	const nodeMemory = subject.getNodeMemory(node.getId(), tree.getId())
	t.true(nodeMemory.get('onEnter'))
	t.true(nodeMemory.get('onOpen'))
	t.true(nodeMemory.get('tick'))
	t.true(nodeMemory.get('onClose'))
	t.true(nodeMemory.get('onExit'))
})

test('resulting status is the ERROR if invalid status was returned from node tick', (t) => {
	const { execution, behaviorType, status, createTreeWithRoot, createBehaviorNode } = t.context

	const { subject, tree, node } = createTreeWithRoot({
		tick(context, { child }) {
			return child()
		},
	}, behaviorType.DECORATOR)

	tree.addNodeChild(node, createBehaviorNode(tree, {
		tick() {
			return 'INVALID'
		},
	}))

	const expected = status.ERROR
	const actual = execution(subject)
	t.is(actual, expected)
})

test('planExecution() accepts factory function to provide tools added to context for a given subject', (t) => {
	const { instance, behaviorType, createTreeWithRoot, createBehaviorNode } = t.context

	const { subject, tree, node } = createTreeWithRoot({
		tick(context, { child }) {
			t.true(context.expected)
			return child()
		},
	}, behaviorType.DECORATOR)

	tree.addNodeChild(node, createBehaviorNode(tree, {
		tick({ status, expected }) {
			t.true(expected)
			return status.SUCCESS
		},
	}))

	const execution = instance.planExecution(() => (
		{ expected: true }
	))

	t.plan(2)
	execution(subject)
})
