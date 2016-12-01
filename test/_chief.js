import { test } from 'ava'
import { transform } from 'buble'

import Chief from '../src/Chief'
import stateFixture from './fixture'

test.beforeEach((t) => {
	t.context.Chief = Chief
	t.context.instance = Chief.create({
		preloadedState: stateFixture(),
		transpiler(code) {
			return transform(code, {
				target: { node: Math.min(6, process.version.substring(1, 2)) },
				transforms: { dangerousForOf: true },
			}).code
		},
	})
	t.context.getState = (selector) => t.context.instance.store.select(selector)()
})

export default Chief
