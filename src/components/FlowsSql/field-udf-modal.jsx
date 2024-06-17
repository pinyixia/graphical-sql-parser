import { Modal, Table } from 'antd';
import { useState, useEffect } from 'react';

const FieldUDFModal = ({ modalOpen, handleModalClose, handleSelectField, sqlSyntaxJSON }) => {
  const [fieldList, setFieldList] = useState([])
  const [names, setNames] = useState([])

  useEffect(() => {
    if (sqlSyntaxJSON['SELECT'] && sqlSyntaxJSON['SELECT'][0] !== '*') {
      setFieldList(sqlSyntaxJSON['SELECT'])
    }
  }, [JSON.stringify(sqlSyntaxJSON)])

  const columns = [
    {
      title: '字段名',
      dataIndex: 'name',
      render: (text) => <a>{text}</a>,
    },
  ];
  const data = fieldList.map((item, index) => ({
    key: index + 1,
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
  };

  return (
    <Modal
      title="UDF函数处理选择"
      open={modalOpen}
      onOk={() => handleSelectField(names)}
      onCancel={handleModalClose}
      maskClosable={false}
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