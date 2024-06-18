// 查询语句生成
export const SQLJSON = (source, target, sqlSyntax) => {
  const newSqlSyntax = { ...sqlSyntax }
  if (source.type === 'rule' && target.type === 'table') {
    if (source.content === 'SELECT') {
      newSqlSyntax[source.content] = ['*']
    }
    if (target.type === 'table') {
      newSqlSyntax['FROM'] = [target.name]
    }
  }
  if (source.type === 'table' && target.type === 'rule') {
    if (['>', '<', '=', '>=', '<=', '!='].includes(target.content)) {
      newSqlSyntax['WHERE'] = []
    }
  }
  return newSqlSyntax
}

// 规则语句生成
export const RuleSyntax = (source, target, sqlSyntax) => {
  const newSqlSyntax = { ...sqlSyntax }
  if (target.content === 'OR') {
    newSqlSyntax['WHERE']?.push({ 'OR': [] })
  } else if (target.content === 'AND') {
    newSqlSyntax['WHERE']?.push({ 'AND': [] })
  }
  return newSqlSyntax
}

// 语法校验
export const SQLSyntaxError = (source, target, sqlSyntax) => {

}

// 根据节点id获取对应的关系边对象
export const getEdgeObj = (graph, cellId, direction = 'target') => {
  const edges = graph.getEdges();
  const connectedEdges = edges.filter(edge => {
    const source = edge.getSourceCellId();
    const target = edge.getTargetCellId();
    if (direction === 'source') {
      return source === cellId;
    } else {
      return target === cellId;
    }
  });
  return connectedEdges
}