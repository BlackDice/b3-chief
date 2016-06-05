import Model from '../core/Model';
import Blackboard from '../behavior3js/core/Blackboard';

const SubjectModel = Model('Subject')
	.getter('id')
	.getter('target')
	.getter('treeId')
	.getter('blackboardInterface', createBlackboardInterface)
	.methods({ toString })
;

function createBlackboardInterface() {
	return new Blackboard();
}

function toString() {
	return this.getId();
}

export default SubjectModel;
