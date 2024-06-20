import { Input, Modal, Table, message } from 'antd';
import { useState, useEffect } from 'react';

const FieldUDFModal = ({
  modalOpen,
  handleModalClose,
  handleSelectField,
  currentUDFFieldList,
  udfSelectData,
  targetCellNode
}) => {
  const [fieldList, setFieldList] = useState([])
  const [names, setNames] = useState(udfSelectData[targetCellNode?.id] ? udfSelectData[targetCellNode?.id]['fieldList'] : [])
  const [asName, setAsName] = useState(udfSelectData[targetCellNode?.id] ? udfSelectData[targetCellNode?.id]['asName'] : '')

  useEffect(() => {
    if (currentUDFFieldList) {
      setFieldList(currentUDFFieldList)
    }
  }, [currentUDFFieldList])

  const columns = [
    {
      title: '字段名',
      dataIndex: 'name',
      render: (text) => <a>{text}</a>,
    },
  ];
  const data = fieldList.map((item, index) => ({
    key: item,
    name: item,
  }))

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      const names = selectedRows.map(item => item.name)
      setNames(names)
    },
    getCheckboxProps: (record) => ({
      name: record.name,
    }),
    selectedRowKeys: [...names]
  };

  return (
    <Modal
      title="UDF函数处理选择"
      open={modalOpen}
      onOk={() => {
        if (!asName) {
          message.error('别名不能为空')
          return
        }
        const { name } = targetCellNode?.getData()
        udfSelectData[targetCellNode?.id] = {}
        udfSelectData[targetCellNode?.id]['fieldList'] = names
        udfSelectData[targetCellNode?.id]['asName'] = asName
        udfSelectData[targetCellNode?.id]['udfName'] = name
        handleSelectField(udfSelectData)
      }}
      onCancel={handleModalClose}
      maskClosable={false}
      destroyOnClose
    >
      别名：<Input value={asName} onChange={({ target: { value } }) => { setAsName(value) }} />
      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        columns={columns}
        dataSource={data}
      />
    </Modal>
  )
}

export default FieldUDFModal