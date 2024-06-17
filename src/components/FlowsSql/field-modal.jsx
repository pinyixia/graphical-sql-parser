import { Modal, Table } from 'antd';
import { useState } from 'react';

const FieldModal = ({ modalOpen, handleModalClose, handleSelectField }) => {
  const [names, setNames] = useState([])
  const columns = [
    {
      title: '字段名',
      dataIndex: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '字段类型',
      dataIndex: 'type',
    },
  ];
  const data = [
    {
      key: '1',
      name: 'name',
      type: 'string',
    },
    {
      key: '2',
      name: 'ID',
      type: 'number',
    },
    {
      key: '3',
      name: 'agentName',
      type: 'string',
    },
    {
      key: '4',
      name: 'consumerUUID',
      type: 'string',
    },
  ];

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
      title="字段选择"
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

export default FieldModal