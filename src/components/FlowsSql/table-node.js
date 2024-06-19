const tableContent = [{
  label: 'opensource_table',
  type: 'table'
}, {
  label: 'device_uuid_table',
  type: 'table'
}, {
  label: 'CONCAT',
  type: 'fun'
}, {
  label: 'UDF_FUN',
  type: 'udf'
}]

export const handleTableList = (graph, stencil) => {
  const tableArr = tableContent.map(content => graph.createNode({
    shape: 'react-custom-rect',
    label: content.label,
    height: 38,
    data: {
      name: content.label,
      type: content.type
    },
  }))

  stencil.load(tableArr, 'table')
}