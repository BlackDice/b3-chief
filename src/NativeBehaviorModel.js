import t from 'tcomb'
import { methods } from 'stampit'
import { oneLine } from 'common-tags'

import { Behavior, NativeBehavior, Compilation } from './types'

import Model from './core/Model'

const Adapter = methods({
	get(propertyName, dataSource) {
		return dataSource()[propertyName]
	},
	getDefinition() {
		throw new Error(oneLine`
			Definition for native behavior cannot be read.
			Check isNative property to distinguish between these behaviors.
		`)
	},
	set() {
		throw new Error(oneLine`
			Native behavior properties cannot be changed.
			Check isNative property to distinguish between these behaviors.
		`)
	},
})

const NativeBehaviorSetupObject = t.interface({
	behavior: NativeBehavior,
	compilation: Compilation,
})

export default Model(Behavior, Adapter)
	.statics({
		create({ behavior, compilation }: NativeBehaviorSetupObject) {
			const nativeBehavior = {
				id: `Native-${behavior.name}`,
				...behavior,
			}

			const model = this(nativeBehavior.id, compilation)
			model.dataSource = () => nativeBehavior
			model.getCompilation = () => compilation
			return model
		},
	})
	.methods({
		destroy() {
			throw new Error(`Native behavior ${this.getName} cannot be destroyed`)
		},
		toString() {
			return this.getId()
		},
	})
	.propertyDescriptors({
		isNative: { value: true },
	})
