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
import ExecutionCompiler from './ExecutionCompiler'

import { Status as StatusType } from './types'
import { BEHAVIOR_TYPE } from './const'

const log = debug('chief')
const logTick = debug('chief:tick')

const Execution = compose(
	SubjectList, TreeList, BehaviorList, Compiler, {
		methods: { planExecution },
	}
)

function planExecution(toolboxFactory = () => null, onError = log) {
	const getExecutionRootNode = ObjectCache(
		buildExecutionTree, (tree) => tree.getId()
	)

	const getSubjectExecution = ObjectCache(
		buildSubjectExecution, (subject) => subject.getId()
	)

	const toolbox = ExecutionToolbox.create({ onError })
	const getSubjectTargetToolbox = ObjectCache(
		(subject) => assembleSubjectToolbox(toolbox, toolboxFactory(subject)),
		(subject) => subject.getTarget()
	)

	const compileBehavior = ExecutionCompiler({ compiler: this.compiler, onError })

	const buildExecutionNode = (node) => {
		const behaviorId = node.getBehaviorId()
		const behavior = this.getBehavior(behaviorId)
		const compilation = compileBehavior(behavior)
		return createExecutionNode(node, behavior, compilation)
	}

	const getTreeExecution = (subjectExecution) => (treeId) => {
		const tree = this.getTree(treeId)
		if (tree === null) {
			return toolbox.error('trying to execute invalid tree %s', treeId)
		}

		const rootExecutionNode = getExecutionRootNode(tree, buildExecutionNode)
		if (rootExecutionNode === null) {
			return toolbox.error('%s has no root node attached', treeId)
		}

		return subjectExecution(rootExecutionNode)
	}

	const executeSubject = (subject) => {
		const subjectToolbox = getSubjectTargetToolbox(subject)
		ExecutionToolbox.reset(subjectToolbox)

		const subjectExecution = getSubjectExecution(subject, subjectToolbox)
		const executeTree = getTreeExecution(subjectExecution)

		// this isn't very pretty solution as it makes the function accessible
		// on execution context object as well and it shouldn't be possible to
		// execute tree in different method than tick
		// however with current layout there is other way to pass that all the
		// way down there (createSubtreeExecutionTick)
		subjectToolbox.executeTree = executeTree

		log('executing subject %s with target %s', subject.getId(), subject.getTarget())
		return executeTree(subject.getTreeId())
	}

	return executeSubject
}

const isNodeOpenMemoryTag = '__isOpen'

function execute(executionNode, executionContext, executionTick) {
	const { memory, status: { ERROR, RUNNING }} = executionContext

	if (executeEnter(executionNode, executionContext) === ERROR) {
		return ERROR
	}

	const isClosed = memory.get(isNodeOpenMemoryTag) !== true

	if (isClosed && executeOpen(executionNode, executionContext) === ERROR) {
		return ERROR
	}

	const tickStatus = executeTick(
		executionNode, executionContext, executionTick
	)

	if (tickStatus !== RUNNING) {
		if (executeClose(executionNode, executionContext) === ERROR) {
			return ERROR
		}
	}

	if (executeExit(executionNode, executionContext) === ERROR) {
		return ERROR
	}

	return tickStatus
}

function executeEnter({ node, compilation }, executionContext) {
	log('entering node %s...', node)
	return executeCompilation(compilation, 'onEnter', executionContext)
}

function executeOpen(executionNode, executionContext) {
	log('opening node %s...', executionNode.node)
	const result = executeCompilation(executionNode.compilation, 'onOpen', executionContext)
	if (result === executionContext.status.ERROR) {
		// if open fails, the exit should be still executed for a cleanup
		executeExit(executionNode, executionContext)
	} else {
		executionContext.memory.set(isNodeOpenMemoryTag, true)
	}
	return result
}

function executeTick({ node, compilation }, executionContext, executionTick) {
	log('ticking node %s...', node)

	const resultStatus = executeCompilation(
		compilation, 'tick', executionContext, executionTick
	)

	if (StatusType.is(resultStatus) === false) {
		return executionContext.error(
			'invalid status returned by node %s: %s',
			node, resultStatus
		)
	}

	logTick('node %s result: %s', node, resultStatus)
	return resultStatus
}

function executeClose({ node, compilation }, executionContext) {
	log('closing node %s...', node)
	const result = executeCompilation(compilation, 'onClose', executionContext)
	executionContext.memory.set(isNodeOpenMemoryTag, false)
	return result
}

function executeExit({ node, compilation }, executionContext) {
	log('exiting node %s...', node)
	return executeCompilation(compilation, 'onExit', executionContext)
}

function executeCompilation(compilation, methodName, ...args) {
	try {
		return Reflect.apply(compilation[methodName], compilation, args)
	} catch (err) {
		const [executionContext] = args
		return executionContext.error(
			err, 'failed to execute method %s on %s', methodName, compilation.behavior
		)
	}
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

function assembleSubjectToolbox(toolbox, toolboxFactoryOutput) {
	if (t.Object.is(toolboxFactoryOutput)) {
		return assign(toolboxFactoryOutput, toolbox)
	}
	return assign({}, toolbox)
}

function createExecutionContext(executionNode, subject, toolbox) {
	return assign({
		config: executionNode.config,
		memory: subject.getNodeMemory(executionNode.node.getId(), executionNode.treeId),
		treeMemory: subject.getTreeMemory(executionNode.treeId),
		subjectMemory: subject.getSubjectMemory(),
	}, toolbox)
}

const executionTickByBehaviorType = {
	[BEHAVIOR_TYPE.DECORATOR]: createDecoratorExecutionTick,
	[BEHAVIOR_TYPE.COMPOSITE]: createCompositeExecutionTick,
	[BEHAVIOR_TYPE.SUBTREE]: createSubtreeExecutionTick,
}

function createExecutionTick(executionNode, ...args) {
	const factoryFunction = executionTickByBehaviorType[executionNode.type]
	if (factoryFunction !== undefined) {
		return factoryFunction(executionNode, ...args)
	}
	return {}
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

function createSubtreeExecutionTick(executionNode, executeNode, toolbox) {
	return { executeTree: toolbox.executeTree }
}

export default Execution
