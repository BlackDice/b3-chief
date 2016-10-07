import { init } from 'stampit'
import debug from 'debug'

import { STATUS } from './const'

const log = debug('chief')

const ExecutionToolbox = init(initializeToolbox).statics({ reset: resetToolbox })

function initializeToolbox() {
	return Object.freeze({
		status: Object.freeze(STATUS),
		timestamp: createTimestampTool(),
		error(...args) {
			log(...args)
			return STATUS.ERROR
		},
	})
}

function createTimestampTool() {
	let currentTimestamp = null
	const timestamp = (reset = false) => {
		if (reset === true || currentTimestamp === null) {
			currentTimestamp = Date.now()
		}
		return currentTimestamp
	}
	return timestamp
}

export function resetToolbox(toolbox) {
	toolbox.timestamp(true)
}

export default ExecutionToolbox
