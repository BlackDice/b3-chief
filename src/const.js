import keymirror from 'keymirror'

/**
 * Type of behavior
 * @readonly
 * @enum {number}
 */
export const BEHAVIOR_TYPE = keymirror({
	COMPOSITE: null,
	DECORATOR: null,
	LEAF: null,
	SUBTREE: null,
})

export const STATUS = keymirror({
	SUCCESS: null,
	RUNNING: null,
	FAILURE: null,
	ERROR: null,
})
