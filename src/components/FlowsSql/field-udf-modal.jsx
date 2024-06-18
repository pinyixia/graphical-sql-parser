import { Modal, Table } from 'antd';
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
  const [names, setNames] = useState(udfSelectData[targetCellNode?.id] || [])

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
        udfSelectData[targetCellNode?.id] = names
        handleSelectField(udfSelectData)
      }}
      onCancel={handleModalClose}
      maskClosable={false}
      destroyOnClose
    >
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