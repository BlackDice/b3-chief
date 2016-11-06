/**
 * @module Chief
 */

import { compose } from 'stampit'

import Store from './Store'

import NativeBehaviorModel from './NativeBehaviorModel'
import nativeBehaviors from './behaviors'

const NativeBehaviors = compose(
	Store, {
		init: initializeNativeBehaviors,
	},
)

function initializeNativeBehaviors() {
	const nativeModels = nativeBehaviors.map((nativeBehavior) => (
		NativeBehaviorModel.create(nativeBehavior)
	))

	const nativeModelMap = nativeModels.reduce((result, nativeModel) => (
		{ ...result, [nativeModel.getId()]: nativeModel }
	), Object.create(null))

	const getNativeBehavior = (behaviorId) => (
		nativeModelMap[behaviorId] || null
	)

	const getNativeBehaviorByName = (behaviorName) => (
		nativeModels.find((model) => model.getName() === behaviorName) || null
	)

	const listNativeBehaviors = () => (
		Array.from(nativeModels)
	)

	Object.assign(this, { getNativeBehavior, getNativeBehaviorByName, listNativeBehaviors })
}

export default NativeBehaviors
