import Model from '../core/Model';

const SubjectModel = Model('Subject')
	.getter('id')
	.property('treeId')
;

export default SubjectModel;
