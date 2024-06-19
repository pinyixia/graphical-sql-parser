import { Select, Input, Modal, Space, Button, Form } from 'antd';
import { useEffect, useState } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const FieldRuleModal = ({
  modalOpen,
  handleModalClose,
  sqlSyntaxJSON,
  targetCellNode,
  sourceCellNode,
  ruleFormData,
  updateFormData,
  graph
}) => {
  const [fieldList, setFieldList] = useState([])
  const targetCellData = targetCellNode?.getData() || {}
  const sourceCellData = sourceCellNode?.getData() || {}

  useEffect(() => {
    // 条件需要优化
    if (sqlSyntaxJSON['SELECT'] && sqlSyntaxJSON['SELECT'][0] !== '*') {
      const filterList = []
      sqlSyntaxJSON['SELECT'].forEach(item => {
        if (typeof item === 'object') {
          Object.keys(item).forEach(key => {
            if (key === 'AS') {
              filterList.push(item[key])
            }
          })
        } else {
          filterList.push(item)
        }
      })
      setFieldList(filterList)
    }
  }, [JSON.stringify(sqlSyntaxJSON)])

  const onFinish = (values) => {
    const newValues = { ...values, sourceRule: sourceCellData?.content, targetRule: targetCellData?.content }
    ruleFormData[targetCellNode?.id] = newValues
    updateFormData(ruleFormData)
  };

  return (
    <Modal
      title="字段规则"
      open={modalOpen}
      onCancel={handleModalClose}
      maskClosable={false}
      footer={null}
      destroyOnClose
    >
      <Form
        name="dynamic_form_nest_item"
        onFinish={onFinish}
        style={{
          maxWidth: 600,
        }}
        autoComplete="off"
        initialValues={{ ...ruleFormData[targetCellNode?.id] }}
      >
        <Form.List name="rule">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{
                    display: 'flex',
                    marginBottom: 8,
                  }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, 'field']}
                    rules={[
                      {
                        required: true,
                        message: 'Missing first name',
                      },
                    ]}
                  >
                    <Select
                      style={{ width: 200 }}
                      placeholder='选择字段'
                      options={fieldList.map(fieldName => ({ value: fieldName, label: fieldName }))}
                    />
                  </Form.Item>
                  <Form.Item>
                    {targetCellData?.content}
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'value']}
                    rules={[
                      {
                        required: true,
                        message: 'Missing last name',
                      },
                    ]}
                  >
                    <Input placeholder='输入内容' />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加规则
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item style={{ textAlign: 'right' }}>
          <Button type="primary" htmlType="submit">
            确定
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default FieldRuleModal