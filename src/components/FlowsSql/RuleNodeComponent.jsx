import './index.css'

const RuleNodeComponent = ({ node }) => {
  const { content = '' } = node.getData()

  return (
    <div
      className="react-node-rule"
      style={{
        border: '2px solid #13c2c2',
        backgroundColor: '#87e8de',
        textAlign: 'center'
      }}
    >
      {content || '规则'}
    </div>
  )
}

export default RuleNodeComponent