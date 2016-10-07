import t from 'tcomb'
import debug from 'debug'
import warning from 'warning'
import { compose } from 'stampit'
import { oneLine } from 'common-tags'

import { assign } from './core/Object'
import ObjectCache from './core/ObjectCache'

import SubjectList from './SubjectList'
import TreeList from './TreeList'
import BehaviorList from './BehaviorList'
import Compiler from './Compiler'
import ExecutionToolbox from './ExecutionToolbox'

import { Status as StatusType } from './types'
import { BEHAVIOR_TYPE } from './const'

const log = debug('chief')

const Execution = compose(
	SubjectList, TreeList, BehaviorList, Compiler, {
		methods: { planExecution },
	}
)

function planExecution(toolboxFactory) {
	const compileBehavior = (behavior) => (
		sanitizeCompilation(t.Function.is(behavior.getCompilation)
			? behavior.getCompilation()
			: this.compiler(precompileBehavior(behavior))
		)
	)

	const getCompilation = ObjectCache(
		compileBehavior, (behavior) => behavior.getId()
	)

	const getExecutionRootNode = ObjectCache(
		buildExecutionTree, (tree) => tree.getId()
	)

	const getSubjectExecution = ObjectCache(
		buildSubjectExecution, (subject) => subject.getId()
	)

	const toolbox = ExecutionToolbox.create()
	const getSubjectTargetToolbox = (t.Function.is(toolboxFactory)
		? ObjectCache(toolboxFactory, (subject) => subject.getTarget())
		: () => toolbox
	)

	const buildExecutionNode = (node) => {
		const behaviorId = node.getBehaviorId()
		const behavior = this.getBehavior(behaviorId)
		const compilation = getCompilation(behavior)
		return createExecutionNode(node, behavior, compilation)
	}

	const executeSubject = (subject) => {
		const treeId = subject.getTreeId()
		const tree = this.getTree(treeId)
		if (tree === null) {
			return toolbox.error('%s has invalid tree %s assigned', subject, treeId)
		}

		const rootExecutionNode = getExecutionRootNode(tree, buildExecutionNode)
		if (rootExecutionNode === null) {
			return toolbox.error('%s has no root node attached', tree)
		}

		const subjectToolbox = getSubjectTargetToolbox(subject, toolbox)
		ExecutionToolbox.reset(subjectToolbox)

		const subjectExecution = getSubjectExecution(subject, subjectToolbox)
		return subjectExecution(rootExecutionNode)
	}

	return executeSubject
}

const isNodeOpenMemoryTag = '__isOpen'

function execute(executionNode, executionContext, executionTick) {
	const { memory } = executionContext

	executeEnter(executionNode, executionContext)

	if (memory.get(isNodeOpenMemoryTag) !== true) {
		executeOpen(executionNode, executionContext)
	}

	const tickStatus = executeTick(
		executionNode, executionContext, executionTick
	)

	if (tickStatus !== executionContext.status.RUNNING) {
		executeClose(executionNode, executionContext)
	}

	executeExit(executionNode, executionContext)

	return tickStatus
}

function executeEnter({ node, compilation }, executionContext) {
	log('entering node %s...', node)
	compilation.onEnter(executionContext)
}

function executeOpen({ node, compilation }, executionContext) {
	log('opening node %s...', node)
	compilation.onOpen(executionContext)
	executionContext.memory.set(isNodeOpenMemoryTag, true)
}

function executeTick({ node, compilation }, executionContext, executionTick) {
	log('tick node %s', node)
	const resultStatus = compilation.tick(executionContext, executionTick)
	if (StatusType.is(resultStatus) === false) {
		return executionContext.error(
			'invalid status returned by node %s: %s',
			node, resultStatus
		)
	}
	log('tick node %s status: %s', node, resultStatus)
	return resultStatus
}

function executeClose({ node, compilation }, executionContext) {
	log('closing node %s...', node)
	compilation.onClose(executionContext)
	executionContext.memory.set(isNodeOpenMemoryTag, false)
}

function executeExit({ node, compilation }, executionContext) {
	log('exiting node %s...', node)
	compilation.onExit(executionContext)
}

function buildSubjectExecution(subject, toolbox) {
	const getExecutionContext = ObjectCache(createExecutionContext)
	const getExecutionTick = ObjectCache(createExecutionTick)

	function executeNode(executionNode) {
		const executionContext = getExecutionContext(executionNode, subject, toolbox)
		const executionTick = getExecutionTick(executionNode, executeNode, toolbox)
		return execute(executionNode, executionContext, executionTick)
	}

	return executeNode
}

function buildExecutionTree(tree, buildExecutionNode) {
	const treeId = tree.getId()
	const nodes = tree.listNodes()
	const executionNodes = nodes.map(buildExecutionNode)
	const executionNodeMap = executionNodes.reduce(convertToNodeMap, {})

	let rootExecutionNode = null

	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i]
		const executionNode = executionNodeMap[node.getId()]

		executionNode.treeId = treeId

		const parentId = node.getParentId()
		if (parentId === treeId) {
			rootExecutionNode = executionNode
		} else {
			const parentExecutionNode = executionNodeMap[parentId]
			if (parentExecutionNode !== undefined) {
				parentExecutionNode.children[node.getChildIndex()] = executionNode
			}
		}
	}

	return rootExecutionNode
}

function convertToNodeMap(map, executionNode) {
	return assign(map, { [executionNode.node.getId()]: executionNode })
}

function createExecutionNode(node, behavior, compilation) {
	warning(!t.Nil.is(behavior), oneLine`
		Unknown behavior %s specified for node %s.
	`, node.getBehaviorId(), node.getId())

	warning(!t.Nil.is(compilation), oneLine`
		Compilation for behavior %s is missing.
	`, node.getBehaviorId())

	if (!(behavior || compilation)) {
		return null
	}

	const type = behavior.getType()
	const config = assembleNodeConfig(
		behavior.getConfig(),
		node.getBehaviorConfig(),
	)

	return {
		node,
		type,
		config,
		compilation,
		children: [],
	}
}

function assembleNodeConfig(behaviorConfig, nodeConfig) {
	return assign({}, behaviorConfig || {}, nodeConfig || {})
}

function createExecutionContext(executionNode, subject, toolbox) {
	return assign({
		config: executionNode.config,
		memory: subject.getNodeMemory(executionNode.node.getId(), executionNode.treeId),
		treeMemory: subject.getTreeMemory(executionNode.treeId),
		subjectMemory: subject.getSubjectMemory(),
	}, toolbox)
}

function createExecutionTick(executionNode, executeNode, toolbox) {
	switch (executionNode.type) {
	case BEHAVIOR_TYPE.DECORATOR:
		return createDecoratorExecutionTick(executionNode, executeNode, toolbox)
	case BEHAVIOR_TYPE.COMPOSITE:
		return createCompositeExecutionTick(executionNode, executeNode)
	default:
		return {}
	}
}

function createDecoratorExecutionTick(executionNode, executeNode, toolbox) {
	const validExecutionNode = executionNode.children.find(Boolean)
	if (validExecutionNode === undefined) {
		return {
			child: () => toolbox.error('decorator node %s is missing required child', executionNode.node),
		}
	}
	return {
		child: executeNode.bind(undefined, validExecutionNode),
	}
}

function createCompositeExecutionTick(executionNode, executeNode) {
	const children = executionNode.children.map((child) => executeNode.bind(undefined, child))
	return { children }
}

function precompileBehavior(behavior) {
	return `
		'use strict';
		var compiled = ${behavior.getDefinition()};
		compiled;
	`
}

const emptyLifecycleMethod = () => {}
const initialCompilation = {
	onEnter: emptyLifecycleMethod,
	onOpen: emptyLifecycleMethod,
	onClose: emptyLifecycleMethod,
	onExit: emptyLifecycleMethod,
}

function sanitizeCompilation(compilation) {
	return {
		...initialCompilation,
		...compilation,
	}
}

export default Execution
