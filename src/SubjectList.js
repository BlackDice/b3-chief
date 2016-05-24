import stampit from 'stampit';
import invariant from 'invariant';
import warning from 'warning';

import Persist, { TYPE as PersistType } from './Persist';
import Uid from './core/Uid';
import EventEmittable from './core/EventEmittable';
import Private from './core/Private';

import SubjectModel from './model/Subject';

const SubjectList = stampit({
	initializers: initializeData,
	methods: {
		addSubject, removeSubject,
		getSubject, listSubjects,
	},
}).compose(Uid, EventEmittable, Persist);

const privates = Private.create();

function initializeData() {
	privates.init(this);
	privates.set(this, 'subjects', new Map());
}

function addSubject(tree) {
	invariant(tree,
		'The tree model expected for addSubject call for assigning tree to subject.'
	);

	const subjectId = this.createUid();
	const subject = SubjectModel({
		id: subjectId,
		treeId: tree.getId(),
	});

	this.persist(PersistType.SUBJECT, subject);
	privates.get(this, 'subjects').set(subjectId, subject);
	this.emit('subject.add', subject);
	return subject;
}

function getSubject(subjectId) {
	return privates.get(this, 'subjects').get(subjectId) || null;
}

function removeSubject(subjectId) {
	const subject = privates.get(this, 'subjects').get(subjectId);
	warning(subject,
		'Trying to remove subject with ID `%s` that no longer exists.', subjectId
	);

	this.destroy(PersistType.SUBJECT, subjectId);
	privates.get(this, 'subjects').delete(subjectId);
	this.emit('subject.remove', subject);
	return subject;
}

function listSubjects(tree = null) {
	const subjects = privates.get(this, 'subjects');
	if (tree === null) {
		return Array.from(subjects.values());
	}
	const treeId = tree.getId();
	const result = [];
	for (const subject of subjects.values()) {
		if (subject.getTreeId() === treeId) {
			result.push(subject);
		}
	}
	return result;
}

export default SubjectList;
