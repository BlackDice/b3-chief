export function hasOwnProperty(obj, property) {
	return Object.prototype.hasOwnProperty.call(obj, property)
}

export function values(obj) {
	return Object.keys(obj).map((key) => obj[key])
}

export function assign(...args) {
	return Object.assign(...args)
}
