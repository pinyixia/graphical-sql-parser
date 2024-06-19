import React from 'react'
import { Graph, Shape } from '@antv/x6'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Stencil } from '@antv/x6-plugin-stencil'
import { Selection } from '@antv/x6-plugin-selection'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { register } from '@antv/x6-react-shape'
import { Button, Form, Input, Space, message } from 'antd'
import { LockOutlined, UserOutlined, CodeOutlined, SaveOutlined } from '@ant-design/icons';
import FieldConfig from './field-config'
import { handleRuleList } from "./rule-node";
import { handleTableList } from "./table-node";
import { SQLJSON, RuleSyntax, getEdgeObj } from "@/util/util";
import FieldModal from "./field-modal";
import FieldRuleModal from "./field-rule-modal";
import FieldUDFModal from "./field-udf-modal";
import TableNodeComponent from "./TableNodeComponent";
import RuleNodeComponent from "./RuleNodeComponent";
import './index.css'

let graph = null

export default class Example extends React.Component {
  state = {
    isModalOpen: false,
    connectStatus: false,
    connectLoadingStatus: false,
    sqlSyntax: {},
    refresh: false,
    isRuleModalOpen: false,
    isUDFModalOpen: false,
    ruleFormData: {},
    selectBakFields: {},
    currentUDFFieldList: [],
    udfSelectData: {},
  }
  sourceCellNode = null
  targetCellNode = null

  componentDidMount() {
    // #region 生成画板
    graph = new Graph({
      container: this.container,
      // panning: {
      //   enabled: true
      // },
      mousewheel: {
        enabled: true,
        modifiers: 'ctrl',
        zoomAtMousePosition: true
      },
      scaling: {
        min: 0.5,
        max: 10,
      },
      grid: true,
      background: {
        color: '#F2F7FA',
      },
      interacting: {
        nodeMovable: false,
      },
      connecting: {
        snap: {
          radius: 20,
        },
        allowBlank: false,
        allowLoop: false,
        allowNode: false,
        allowEdge: false,
        allowMulti: false,
        router: 'manhattan',
        connector: {
          name: 'rounded',
          args: {
            radius: 8,
          },
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#a0d911',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 12,
                  height: 8,
                },
              },
            },
            zIndex: 0,
          })
        },
        validateConnection({ targetMagnet }) {
          return !!targetMagnet
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#5F95FF',
              stroke: '#5F95FF',
            },
          },
        },
      },
    })

    // #region 注册工具箱
    graph.use(
      new Snapline({
        enabled: true,
        sharp: true,
      }),
    ).use(
      new Selection({
        rubberband: true,
        showNodeSelectionBox: true,
      }),
    ).use(new Keyboard())

    // 绘制工具箱
    this.toolboxStencil(graph)
  }

  // 工具箱函数
  toolboxStencil = (graph) => {
    // 生成工具箱
    const stencil = new Stencil({
      title: '工具箱',
      target: graph,
      notFoundText: 'Not Found',
      search(cell, keyword) {
        return cell.shape.indexOf(keyword) !== -1
      },
      placeholder: '输入名称',
      stencilGraphHeight: 0,
      layoutOptions: {
        resizeToFit: true,
      },
      groups: [
        {
          name: 'table',
          title: '表',
          collapsable: false,
          graphHeight: 160
        },
        {
          name: 'rule',
          title: '规则',
          collapsable: false,
        },
      ],
    })

    // 添加工具箱节点
    this.stencilContainer.appendChild(stencil.container)

    // 添加事件
    this.addEvent(graph)

    // 绘制图形节点
    this.toolboxNode(graph, stencil)
  }

  // #region 注册事件
  addEvent = (graph) => {
    // 控制连接桩显示/隐藏
    const showPorts = (ports, show) => {
      for (let i = 0, len = ports.length; i < len; i += 1) {
        ports[i].style.visibility = show ? 'visible' : 'hidden'
      }
    }
    graph.on('node:mouseenter', () => {
      const ports = this.container.querySelectorAll(
        '.x6-port-body',
      )
      showPorts(ports, true)
    })
    graph.on('node:mouseleave', () => {
      const ports = this.container.querySelectorAll(
        '.x6-port-body',
      )
      showPorts(ports, false)
    })
    // 双击表事件
    graph.on('cell:dblclick', (node) => {
      const { selectBakFields } = this.state
      const { cell } = node
      const cellData = cell.getData() || {}

      if (!cellData?.relation) {
        message.error('请连接源数据')
        return
      }
      // 过滤出与给定节点 ID 连接的边
      const connectedEdges = getEdgeObj(graph, cell.id, 'target')[0] || {}
      this.sourceCellNode = connectedEdges?.getSourceCell()
      this.targetCellNode = cell

      if (cellData?.type === 'table') {
        this.handleModalOpen()
      } else if (cellData?.type === 'rule' && cellData?.component === 'input') {
        this.handleRuleModalOpen()
      } else if (cellData?.type === 'udf' || cellData?.type === 'fun') {
        const connectedEdges = getEdgeObj(graph, cell?.id, 'target')[0] || {}
        const sourceCellNode = connectedEdges?.getSourceCell()
        const _fieldList = selectBakFields[sourceCellNode?.id] || [];
        this.setState({ currentUDFFieldList: _fieldList }, () => {
          this.handleUDFModalOpen()
        })
      }
    })
    // 删除表事件
    graph.bindKey('backspace', () => {
      const cells = graph.getSelectedCells()
      if (cells.length) {
        graph.removeCells(cells)
      }
    })
    // 连接线事件
    graph.on('edge:connected', ({ isNew, edge, currentCell }) => {
      const { sqlSyntax } = this.state
      if (isNew) {
        const source = edge.getSourceCell()
        this.sourceCellNode = source
        // 对新创建的边进行插入数据库等持久化操作
        // 源头
        const sourceData = source.getData()
        // 目标
        const currentData = currentCell.getData()

        currentCell.setData({ relation: true })
        const operation = ['<', '>', '=', '<=', '>=', '!=']
        if (
          sourceData?.type === 'rule' && currentData?.type === 'table'
          || (sourceData?.type === 'table' && currentData?.type === 'rule' && Object.keys(sqlSyntax).includes('SELECT'))
          || sourceData?.type === 'table' && currentData?.type === 'udf'
          || sourceData?.type === 'table' && currentData?.type === 'fun'
          || sourceData?.type === 'udf' && currentData?.type === 'rule'
          || sourceData?.type === 'fun' && currentData?.type === 'rule'
        ) {
          // 处理JSON格式SQL
          const newSqlSyntax = SQLJSON(sourceData, currentData, sqlSyntax)
          this.setState({ sqlSyntax: newSqlSyntax })
          this.handleRefresh()
        } else if (
          currentData?.type === 'rule'
          && sourceData?.type === 'rule'
          && Object.keys(sqlSyntax).includes('SELECT')
          && !(currentData?.content === 'OR' && sourceData?.content === 'AND')
          && !(operation.includes(currentData?.content) && operation.includes(sourceData?.content))
        ) {
          // 处理规则JSON格式
          const newSqlSyntax = RuleSyntax(sourceData, currentData, sqlSyntax)
          this.setState({ sqlSyntax: newSqlSyntax })
          // this.handleRefresh()
        } else {
          edge.disconnect({ x: 0, y: 0 })
          message.error('语法错误')
        }
      }
    })
    // 节点添加到画布的时候触发
    graph.on('cell:added', ({ cell, index, options }) => {
      const cellData = cell.getData() || {}
      // 添加到画布标识
      cell.setData({ addCanvas: true });
      // 改变宽
      if (cellData?.type === 'rule') {
        cell.resize(100, 35)
      } else if (cellData?.type === 'table') {
        cell.resize(260, 35)
      }
    })
  }

  // #region 节点生成
  toolboxNode = (graph, stencil) => {
    // 初始化连接点图形
    const ports = {
      groups: {
        // top: {
        //   position: 'top',
        //   attrs: {
        //     circle: {
        //       r: 4,
        //       magnet: true,
        //       stroke: '#5F95FF',
        //       strokeWidth: 1,
        //       fill: '#fff',
        //       style: {
        //         visibility: 'hidden',
        //       },
        //     },
        //   },
        // },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
        // bottom: {
        //   position: 'bottom',
        //   attrs: {
        //     circle: {
        //       r: 4,
        //       magnet: true,
        //       stroke: '#5F95FF',
        //       strokeWidth: 1,
        //       fill: '#fff',
        //       style: {
        //         visibility: 'hidden',
        //       },
        //     },
        //   },
        // },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
      },
      items: [
        // {
        //   group: 'top',
        // },
        {
          group: 'right',
        },
        // {
        //   group: 'bottom',
        // },
        {
          group: 'left',
        },
      ],
    }

    // 自定义React节点
    // 表节点
    register({
      shape: 'react-custom-rect',
      effect: ['data'],
      ports: { ...ports },
      component: TableNodeComponent,
    })

    // 规则节点
    register({
      shape: 'react-custom-ellipse',
      effect: ['data'],
      ports: { ...ports },
      component: RuleNodeComponent,
    })

    // 添加到工具箱里
    handleTableList(graph, stencil)
    handleRuleList(graph, stencil)
  }

  // 画板 ref
  refContainer = (container) => {
    this.container = container
  }

  // 工具箱 ref
  refStencil = (container) => {
    this.stencilContainer = container
  }

  handleModalClose = () => {
    this.setState({ isModalOpen: false })
  }

  handleModalOpen = () => {
    this.setState({ isModalOpen: true })
  }

  handleRefresh = () => {
    this.setState(p => ({ refresh: !p.refresh }))
  }

  handleUDFFunction = (udfCell, id) => {
    const { sqlSyntax, udfSelectData, selectBakFields } = this.state
    const { name, type } = udfCell.getData()
    if (udfSelectData[udfCell.id]) {
      const newBakFields = selectBakFields[id].filter(item => !udfSelectData[udfCell.id]['fieldList'].includes(item))
      const funObj = { [name]: udfSelectData[udfCell.id]['fieldList'] }
      if (type === 'fun' || type === 'udf') {
        // 内置函数
        sqlSyntax['SELECT'] = [...newBakFields, funObj, { 'AS': udfSelectData[udfCell.id]['asName'] }]
        console.log(JSON.stringify([...newBakFields, funObj, { 'AS': udfSelectData[udfCell.id]['asName'] }]))
      }
      console.log(JSON.stringify([...newBakFields, funObj, { 'AS': udfSelectData[udfCell.id]['asName'] }]))
    } else {
      sqlSyntax['SELECT'] = selectBakFields[id]
    }
    this.setState({ sqlSyntax })
  }

  handleSelectField = (fields) => {
    const { sqlSyntax, selectBakFields } = this.state

    this.setState({
      selectBakFields: {
        ...selectBakFields,
        [this.targetCellNode?.id]: fields
      }
    }, () => {
      // 过滤出与给定节点 ID 连接的边
      const connectedEdges = getEdgeObj(graph, this.targetCellNode?.id, 'source');
      if (connectedEdges.length) {
        const _TargetCellNode = connectedEdges[0]?.getTargetCell()
        const { type } = _TargetCellNode.getData()
        if (type === 'udf' || type === 'fun') {
          this.handleUDFFunction(_TargetCellNode, this.targetCellNode?.id)
        } else {
          sqlSyntax['SELECT'] = fields
          this.setState({ sqlSyntax })
        }
      } else {
        sqlSyntax['SELECT'] = fields
        this.setState({ sqlSyntax })
      }
      this.handleModalClose()
      this.handleRefresh()
    })
  }

  handleRuleModalOpen = () => {
    this.setState({ isRuleModalOpen: true })
  }

  handleRuleModalClose = () => {
    this.setState({ isRuleModalOpen: false })
  }

  handleFieldRule = () => {
    const { sqlSyntax, ruleFormData } = this.state
    const ruleJSON = []

    Object.keys(ruleFormData).forEach((key, index) => {
      const { rule, sourceRule, targetRule } = ruleFormData[key]
      if (!index) {
        rule.forEach((item, itemIndex) => {
          const { field, value } = item
          if (itemIndex === 0) {
            ruleJSON.push(field, { [targetRule]: value })
          } else {
            ruleJSON.push({
              'AND': [
                field,
                { [targetRule]: value }
              ]
            })
          }
        })
      } else {
        ruleJSON.push({ [sourceRule]: [] })
        rule.forEach((item, itemIndex) => {
          const { field, value } = item
          if (itemIndex === 0) {
            ruleJSON[ruleJSON.length - 1][sourceRule].push(field, { [targetRule]: value })
          } else {
            ruleJSON[ruleJSON.length - 1][sourceRule].push({
              'AND': [
                field,
                { [targetRule]: value }
              ]
            })
          }
        })
      }
    })

    const newSqlSyntax = { ...sqlSyntax, 'WHERE': [...ruleJSON] }
    this.setState({
      sqlSyntax: newSqlSyntax
    }, () => {
      this.handleRuleModalClose()
      this.handleRefresh()
    })
  }

  updateFormData = (newRuleFormData) => {
    this.setState({ ruleFormData: { ...newRuleFormData } }, () => {
      this.handleFieldRule()
    })
  }

  handleUDFModalOpen = () => {
    this.setState({ isUDFModalOpen: true })
  }

  handleUDFModalClose = () => {
    this.setState({ isUDFModalOpen: false })
  }

  handleUDFSelectField = (fields) => {
    this.setState({ udfSelectData: { ...fields } }, () => {
      const connectedEdges = getEdgeObj(graph, this.targetCellNode?.id, 'target');
      const _SourceCellNode = connectedEdges[0]?.getSourceCell()
      this.handleUDFFunction(this.targetCellNode, _SourceCellNode?.id)
      this.handleUDFModalClose()
      this.handleRefresh()
    })
  }

  render() {
    const {
      sqlSyntax,
      connectStatus,
      connectLoadingStatus,
      isModalOpen,
      isRuleModalOpen,
      refresh,
      ruleFormData,
      isUDFModalOpen,
      currentUDFFieldList,
      udfSelectData
    } = this.state

    return (
      <>
        <div
          style={{
            paddingTop: 10,
            paddingBottom: 20,
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <Form
            name="horizontal_login"
            layout="inline"
            onFinish={() => {
              this.setState({ connectLoadingStatus: true })
              setTimeout(() => {
                this.setState(prevState => ({
                  connectStatus: !prevState.connectStatus,
                  connectLoadingStatus: false
                }))
              }, 1000);
            }}
            disabled={connectStatus}
          >
            <Form.Item name="host" >
              <Space.Compact>
                <Input
                  addonBefore="http://"
                  prefix={<CodeOutlined />}
                  type="url"
                  style={{
                    width: '80%',
                  }}
                  placeholder="Host"
                />
                <Input
                  style={{
                    width: '20%',
                  }}
                  placeholder='port'
                />
              </Space.Compact>
            </Form.Item>
            <Form.Item name="username" >
              <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
            </Form.Item>
            <Form.Item name="password" >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Password"
              />
            </Form.Item>
            <Form.Item shouldUpdate>
              {() => (
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={false}
                  loading={connectLoadingStatus}
                >
                  {!connectStatus ? '连接' : '断开'}
                </Button>
              )}
            </Form.Item>
          </Form>
          <Button
            icon={<SaveOutlined />}
            onClick={() => {
              console.log('保存格式', graph.toJSON())
              // graph.toJSON() 导出
              // graph.fromJSON(cells:[]) 导入
            }}
          />
        </div>
        <div className="stencil-app">
          <div className="app-stencil" ref={this.refStencil} />
          <div className="app-content" ref={this.refContainer} />
        </div>
        <FieldConfig codeContent={sqlSyntax} refresh={refresh} />
        <FieldModal
          modalOpen={isModalOpen}
          handleModalClose={this.handleModalClose}
          handleSelectField={this.handleSelectField}
        />
        <FieldRuleModal
          sqlSyntaxJSON={sqlSyntax}
          modalOpen={isRuleModalOpen}
          handleModalClose={this.handleRuleModalClose}
          targetCellNode={this.targetCellNode}
          sourceCellNode={this.sourceCellNode}
          ruleFormData={ruleFormData}
          updateFormData={this.updateFormData}
          graph={graph}
        />
        <FieldUDFModal
          modalOpen={isUDFModalOpen}
          handleModalClose={this.handleUDFModalClose}
          handleSelectField={this.handleUDFSelectField}
          targetCellNode={this.targetCellNode}
          currentUDFFieldList={currentUDFFieldList}
          udfSelectData={udfSelectData}
        />
      </>
    )
  }
}