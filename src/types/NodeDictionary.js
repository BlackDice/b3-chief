import t from 'tcomb'

import Identity from './Identity'
import Node from './Node'

export default t.dict(Identity, Node, 'NodeDictionary')
