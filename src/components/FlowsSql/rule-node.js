const commonAttrs = {
  body: {
    fill: '#e6fffb',
    stroke: '#b5f5ec',
    strokeWidth: 2
  },
}

const ruleContent = [{
  label: 'SELECT',
  type: 'string'
},
{
  label: 'AND',
  type: 'string'
},
{
  label: 'OR',
  type: 'string'
},
{
  label: '<',
  type: 'input'
},
{
  label: '>',
  type: 'input'
},
{
  label: '=',
  type: 'input'
},
{
  label: '>=',
  type: 'input'
},
{
  label: '<=',
  type: 'input'
},
{
  label: '!=',
  type: 'input'
}]

export const handleRuleList = (graph, stencil) => {
  const nodeArr = ruleContent.map(item => graph.createNode({
    shape: 'react-custom-ellipse',
    width: 80,
    height: 40,
    label: item.label,
    attrs: commonAttrs,
    data: {
      content: item.label,
      component: item.type,
      type: 'rule',
      addCanvas: false
    },
  }))


  stencil.load(nodeArr, 'rule')
}
