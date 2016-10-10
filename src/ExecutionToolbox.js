import { init } from 'stampit'

import { STATUS } from './const'

const ExecutionToolbox = init(initializeToolbox).statics({ reset: resetToolbox })

function initializeToolbox({ onError }) {
	return Object.freeze({
		status: Object.freeze(STATUS),
		timestamp: createTimestampTool(),
		error(...args) {
			onError(...args)
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
