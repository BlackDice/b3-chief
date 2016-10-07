import { compose } from 'stampit'
import invariant from 'invariant'
import warning from 'warning'
import { oneLine } from 'common-tags'

import Store from './Store'
import setupModelList from './core/ModelList'
import setupSubjectModel from './SubjectModel'

const SubjectList = compose(
	Store, {
		init: initializeSubjectList,
		methods: {
			addSubject,
			createSubject,
			destroySubject,
			hasSubject,
			getSubject,
			listSubjects,
		},
	}
)

const bList = Symbol('list of subjects')

function initializeSubjectList() {
	this[bList] = setupModelList(
		setupSubjectModel(this.store),
		this.store.select(this.store.selectors.subjects),
	)
	this[bList].attachCountProperty(this, 'subjectCount')
}

/**
 * Adds a new subject to state.
 * The id will be auto generated if not specified.
 * @param {Subject} subject
 * @return {SubjectModel}
 */
function addSubject(subject) {
	return this[bList].create(subject)
}

/**
 * Creates and adds new subject to the list.
 * @param {Identity} treeId override ID of subject instead of random one
 * @param {SubjectTarget} target optional target of the subject
 */
function createSubject(treeId, target = null) {
	const treeModel = this.getTree(treeId)
	invariant(treeModel, oneLine`
		Method createSubject is expecting tree to be executed.
	`)

	return this.addSubject({
		treeId: treeModel.getId(), target,
	})
}

/**
 * Removes subject by specified ID from the list
 * @param {Identity} subjectId
 */
function destroySubject(subjectId) {
	const subjectModel = this.getSubject(subjectId)

	if (subjectModel === null) {
		warning(false, oneLine`
			Trying to destroy subject with id %s that doesn't exists.
		`, subjectModel.getId())
	} else {
		subjectModel.destroy()
	}
}

/**
 * Checks if subject by specified ID is present in the list
 * @param  {Identity} subjectId
 * @return {Boolean}
 */
function hasSubject(subjectId) {
	return this[bList].has(subjectId)
}

/**
 * Returns subject by its ID or null if it doesn't exist
 * @param  {Identity} subjectId
 * @return {SubjectModel}
 */
function getSubject(subjectId) {
	return this[bList].get(subjectId)
}

/**
 * Returns list of all subjects or optionally filtered by specified tree.
 * @param {Identity} tree
 * @return {SubjectModel[]}
 */
function listSubjects(treeId = null) {
	const tree = this.getTree(treeId)
	if (tree === null) {
		return this[bList].getAll()
	}
	return this[bList].filter(tree.getId(), 'treeId')
}

export default SubjectList
