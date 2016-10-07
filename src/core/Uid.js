import { methods } from 'stampit'
import uid from 'uid'

const defaultUidLength = 12

const Uid = methods({ createUid })

export function createUid(prefix = null, length = defaultUidLength) {
	const generated = uid(length)
	return prefix === null ? generated : `${prefix}-${generated}`
}

export default Uid
