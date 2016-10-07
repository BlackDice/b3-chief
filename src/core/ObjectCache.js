const cacheIdentity = (value) => value

function createObjectCache(factory, getCacheKey = cacheIdentity) {
	const cache = (getCacheKey === cacheIdentity
		? new WeakMap()
		: new Map()
	)

	const getOrCreateCacheItem = (cacheObject, ...args) => {
		const cacheKey = getCacheKey(cacheObject)
		let cacheItem = cache.get(cacheKey)
		if (cacheItem === undefined) {
			cacheItem = factory(cacheObject, ...args)
			cache.set(cacheKey, cacheItem)
		}
		return cacheItem
	}

	return getOrCreateCacheItem
}

export default createObjectCache
