const cacheIdentity = (value) => value

function createObjectCache(factory, getCacheKey = cacheIdentity) {
	const cache = (getCacheKey === cacheIdentity
		? new WeakMap()
		: new Map()
	)

	const getOrCreateCacheItem = (cacheObject, arg1, arg2, arg3) => {
		const cacheKey = getCacheKey(cacheObject)
		let cacheItem = cache.get(cacheKey)
		if (cacheItem === undefined) {
			cacheItem = factory(cacheObject, arg1, arg2, arg3)
			cache.set(cacheKey, cacheItem)
		}
		return cacheItem
	}

	return getOrCreateCacheItem
}

export default createObjectCache
