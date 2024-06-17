import { Typography } from 'antd'
import './index.css'

const { Text } = Typography

const TableNodeComponent = ({ node }) => {
  const { name = '', fieldList = [] } = node.getData()

  return (
    <div
      className="react-node-table"
      style={{
        border: '2px solid #5F95FF',
        backgroundColor: '#EFF4FF'
      }}
    >
      <div>
        <Text
          style={{
            lineHeight: '35px',
            textAlign: 'center'
          }}
          ellipsis={{ tooltip: name }}
        >
          {name || '数据表'}
        </Text>
      </div>
    </div>
  )
}

export default TableNodeComponent