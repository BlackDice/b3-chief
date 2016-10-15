import { init } from 'stampit'

import { STATUS } from './const'

const ExecutionToolbox = init(initializeToolbox).statics({ reset: resetToolbox })

function initializeToolbox({ onError }) {
	return {
		status: Object.freeze(STATUS),
		timestamp: createTimestampTool(),
		error(...args) {
			onError(...args)
			return STATUS.ERROR
		},
	}
}

const bReset = Symbol('reset toolbox')

function createTimestampTool() {
	let currentTimestamp = null
	const timestamp = (isReset) => {
		if (isReset === bReset || currentTimestamp === null) {
			currentTimestamp = Date.now()
		}
		return currentTimestamp
	}
	return timestamp
}

export function resetToolbox(toolbox) {
	toolbox.timestamp(bReset)
}

export default ExecutionToolbox
