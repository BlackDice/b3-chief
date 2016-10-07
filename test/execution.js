import test from 'ava'

import './_chief'

import { ExecutionContext, ExecutionTick } from '../src/types'

test.beforeEach((t) => {
	const { instance } = t.context

	let counter = 0

	const behaviors = {}
	instance.getBehavior = (behaviorId) => (
		behaviors[behaviorId] || instance.getNativeBehavior(behaviorId)
	)

	t.context.createBehaviorNode = (tree, compilation, type) => {
		const behavior = instance.createBehavior(`Test${counter += 1}`, type)
		behavior.getCompilation = () => compilation
		behaviors[behavior.getId()] = behavior
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
	t.context.execution = instance.planExecution()
})

test('execution() returns ERROR status if subject has invalid tree', (t) => {
	const { instance, execution, Chief } = t.context

	const subject = instance.createSubject('TestTree')
	instance.destroyTree('TestTree')
	const actual = execution(subject)
	t.is(actual, Chief.STATUS.ERROR)
})

test('execution() returns ERROR status if tree has no root', (t) => {
	const { instance, execution, Chief } = t.context

	const subject = instance.createSubject('EmptyTree')
	const actual = execution(subject)
	t.is(actual, Chief.STATUS.ERROR)
})

test('execution() returns state of root node execution of tick method', (t) => {
	const { execution, Chief, createTreeWithRoot } = t.context

	const { subject } = createTreeWithRoot({
		tick() {
			return Chief.STATUS.SUCCESS
		},
	})

	const actual = execution(subject)
	t.is(actual, Chief.STATUS.SUCCESS)
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
	const { execution, Chief, createTreeWithRoot, createNativeBehaviorNode } = t.context

	const { subject, tree, node } = createTreeWithRoot({
		tick(context, { child }) {
			return child()
		},
	}, Chief.BEHAVIOR_TYPE.DECORATOR)

	tree.addNodeChild(node, createNativeBehaviorNode(tree, 'Succeeder'))

	const actual = execution(subject)
	t.is(actual, Chief.STATUS.SUCCESS)
})

test('the node with composite behavior can execute its children and get their status', (t) => {
	const { execution, Chief, createTreeWithRoot, createNativeBehaviorNode } = t.context

	const { subject, tree, node } = createTreeWithRoot({
		tick(context, { children }) {
			return children.reduce((result, child) => child(), null)
		},
	}, Chief.BEHAVIOR_TYPE.COMPOSITE)

	tree.addNodeChild(node, createNativeBehaviorNode(tree, 'Runner'))
	tree.addNodeChild(node, createNativeBehaviorNode(tree, 'Failer'))
	tree.addNodeChild(node, createNativeBehaviorNode(tree, 'Succeeder'))

	const actual = execution(subject)
	t.is(actual, Chief.STATUS.SUCCESS)
})

test('lifecycle method onEnter is invoked whenever node is being executed', (t) => {
	const { execution, createTreeWithRoot } = t.context

	const { subject } = createTreeWithRoot({
		onEnter(context) {
			ExecutionContext(context)
			t.pass()
		},
		tick({ status }) {
			return status.SUCCESS
		},
	})

	t.plan(1)
	execution(subject)
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

test('lifecycle method onClose is invoked when status is not RUNNING', (t) => {
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

test('lifecycle method onExit is invoked whenever node tick is finished', (t) => {
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

test('resulting status is the ERROR if invalid status was returned from node tick', (t) => {
	const { execution, Chief, createTreeWithRoot, createBehaviorNode } = t.context

	const { subject, tree, node } = createTreeWithRoot({
		tick(context, { child }) {
			return child()
		},
	}, Chief.BEHAVIOR_TYPE.DECORATOR)

	tree.addNodeChild(node, createBehaviorNode(tree, {
		tick() {
			return 'INVALID'
		},
	}))

	const expected = Chief.STATUS.ERROR
	const actual = execution(subject)
	t.is(actual, expected)
})

test('planExecution() accepts factory function to provide tools added to context for a given subject', (t) => {
	const { instance, Chief, createTreeWithRoot, createBehaviorNode } = t.context

	const { subject, tree, node } = createTreeWithRoot({
		tick(context, { child }) {
			t.true(context.expected)
			return child()
		},
	}, Chief.BEHAVIOR_TYPE.DECORATOR)

	tree.addNodeChild(node, createBehaviorNode(tree, {
		tick({ status, expected }) {
			t.true(expected)
			return status.SUCCESS
		},
	}))

	const execution = instance.planExecution((subj, toolbox) => (
		{ ...toolbox, expected: true }
	))

	t.plan(2)
	execution(subject)
})
