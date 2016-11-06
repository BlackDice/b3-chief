/**
 * @module Chief
 */

import { compose } from 'stampit'
import invariant from 'invariant'
import warning from 'warning'
import { oneLine } from 'common-tags'

import setupModelList from './core/ModelList'

import Store from './Store'
import Compiler from './Compiler'
import NativeBehaviors from './NativeBehaviors'
import setupBehaviorModel from './BehaviorModel'

import { BEHAVIOR_TYPE } from './const'

const BehaviorList = compose(
	Store, Compiler, NativeBehaviors, {
		init: initializeBehaviorList,
		methods: {
			addBehavior,
			createBehavior,
			destroyBehavior,
			hasBehavior,
			hasBehaviorName,
			getBehavior,
			getBehaviorByName,
			listBehaviors,
		},
	}
)

const bList = Symbol('list of behaviors')

function initializeBehaviorList() {
	this[bList] = setupModelList(
		setupBehaviorModel(this),
		this.store.select(this.store.selectors.behaviors)
	)
	this[bList].attachCountProperty(this, 'behaviorCount')
}

/**
 * Adds a new behavior to state.
 * The id will be auto generated if not specified.
 * @param {Behavior} behavior
 * @return {Behavior}
 */
function addBehavior(behavior) {
	return this[bList].create(behavior)
}

/**
 * Creates new behavior and adds it to the list
 * @param {CamelCase} behaviorName unique name of a created behavior
 * @param {BehaviorType} [LEAF] behaviorType type of a created behavior
 * @return {Behavior}
 */
function createBehavior(behaviorName, behaviorType = BEHAVIOR_TYPE.LEAF) {
	invariant(behaviorName && behaviorName.length, oneLine`
		Method createBehavior is expecting name of behavior being added.
	`)

	invariant(this.hasBehaviorName(behaviorName) === false, oneLine`
		The behavior named '%s' already exists. Name has to be unique.
	`, behaviorName)

	return this.addBehavior({
		name: behaviorName,
		type: behaviorType,
	})
}

/**
 * Removes existing behavior out of the list
 * @param {Identity} behaviorId
 */
function destroyBehavior(behaviorId) {
	const behaviorModel = this.getBehavior(behaviorId)

	if (behaviorModel === null) {
		warning(false, oneLine`
			Trying to destroy behavior with id %s that doesn't exists.
		`, behaviorId)
	} else {
		behaviorModel.destroy()
	}
}

/**
 * Check if behavior of specified name exists in the list
 * @param {CamelCase} behaviorName name of behavior to check
 * @return {Boolean}
 */
function hasBehaviorName(behaviorName) {
	return Boolean(this.listBehaviors().find((behavior) => (
		behavior.getName() === behaviorName
	)))
}

/**
 * Check if behavior of specified name exists in the list
 * @param {Identity} behaviorName name of behavior to check
 * @return {Boolean}
 */
function hasBehavior(behaviorId) {
	return this[bList].has(behaviorId)
}

/**
 * Retrieve previously added behavior by its ID
 * @param {Identity} behaviorId
 * @return {BehaviorModel}
 */
function getBehavior(behaviorId) {
	const behavior = this[bList].get(behaviorId)
	if (behavior === null) {
		return this.getNativeBehavior(behaviorId)
	}
	return behavior
}

function getBehaviorByName(behaviorName) {
	const behavior = this[bList].find((model) => model.getName() === behaviorName)
	if (behavior === null) {
		return this.getNativeBehaviorByName(behaviorName)
	}
	return behavior
}

/**
 * Returns list of existing behaviors
 * @param {boolean} [withoutNatives=false] Exclude native behaviors
 * @return {Behavior[]} array of behaviors
 */
function listBehaviors(withoutNatives = false) {
	if (withoutNatives === true) {
		return this[bList].getAll()
	}
	return [
		...this.listNativeBehaviors(),
		...this[bList].getAll(),
	]
}

export default BehaviorList
