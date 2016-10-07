import t from 'tcomb'

import Identity from './Identity'
import Memory from './Memory'

export default t.dict(Identity, Memory, 'MemoryDictionary')
