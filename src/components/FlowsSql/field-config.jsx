import { Drawer, Button, ConfigProvider, message } from 'antd'
import { TinyColor } from '@ctrl/tinycolor';
import Editor from '@monaco-editor/react';
import { format } from 'sql-formatter';
import { useEffect, useState } from 'react';
// https://g14n.info/SQL92-JSON/#api
import { parse, stringify } from 'sql92-json'
import ClipboardJS from "clipboard";

const colors1 = ['#6253E1', '#04BEFE'];
const getHoverColors = (colors) =>
  colors.map((color) => new TinyColor(color).lighten(5).toString());
const getActiveColors = (colors) =>
  colors.map((color) => new TinyColor(color).darken(5).toString());

const FieldConfig = ({ codeContent, refresh }) => {
  const [sqlSyntax, setSqlSyntax] = useState('')

  useEffect(() => {
    // 使用 JSON 对象生成 SQL 查询
    const newCodeContent = JSON.parse(JSON.stringify(codeContent))
    const query = stringify(newCodeContent);
    const formattedCode = format(query, { language: 'mysql' })
    setSqlSyntax(formattedCode)
  }, [refresh])

  useEffect(() => {
    const Clipboard = new ClipboardJS('.copy-btn')
    Clipboard.on('success', () => {
      message.success('复制成功')
    })
  }, [])

  return (
    <Drawer
      title="详情配置"
      mask={false}
      open={true}
      closable={false}
      destroyOnClose
      styles={{ body: { padding: 0 } }}
      width={460}
      footer={
        <ConfigProvider
          theme={{
            components: {
              Button: {
                colorPrimary: `linear-gradient(135deg, ${colors1.join(', ')})`,
                colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(colors1).join(', ')})`,
                colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(colors1).join(', ')})`,
                lineWidth: 0,
              },
            },
          }}
        >
          <Button
            type="primary"
            size="large"
            style={{ width: '100%' }}
            className='copy-btn'
            data-clipboard-text={sqlSyntax}
          >
            复制
          </Button>
        </ConfigProvider>
      }
    >
      <Editor
        height="80vh"
        defaultLanguage="javascript"
        defaultValue="// 拖拽生成 SQL 语句"
        value={sqlSyntax}
        options={{
          minimap: { enabled: false },
          readOnly: true,
          scrollBeyondLastLine: false
        }}
      />
    </Drawer>
  )
}

export default FieldConfig