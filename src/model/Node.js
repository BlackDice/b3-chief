import Model, { ModelPrivate } from '../core/Model';

const privates = ModelPrivate.create();

const NodeModel = Model('Node', privates)
	.getter('id')
	.getter('treeId')
	.getter('name')
	.getter('title')
	.getter('description')
	.getter('behaviorNode')
	.methods({ getProperties })
	.init(initializeNodeModel)
;

function initializeNodeModel({ behaviorNode }) {
	privates.setProperty(this, 'behaviorNode', behaviorNode);
}

function getProperties() {
	return { ...this.getBehaviorNode().properties };
}

export default NodeModel;
