import { Card, Table, Tag, Row, Col } from 'antd';
import { FireOutlined, WarningOutlined, StarOutlined, ThunderboltOutlined } from '@ant-design/icons';

const ratingData = [
  { rating: 'SS', color: '#ff4d4f', desc: '传说', icon: '🔥' },
  { rating: 'S', color: '#fa8c16', desc: '史诗', icon: '⭐' },
  { rating: 'A', color: '#faad14', desc: '精英', icon: '💪' },
  { rating: 'B', color: '#52c41a', desc: '高级', icon: '🎯' },
  { rating: 'C', color: '#1677ff', desc: '中级', icon: '⚡' },
  { rating: 'D', color: '#999', desc: '初级', icon: '🛡️' },
  { rating: 'E', color: '#bbb', desc: '入门', icon: '🌱' },
  { rating: 'F', color: '#ddd', desc: '新手', icon: '🐣' },
];

export default function Rules() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 32, textAlign: 'center' }}>
        <h2><FireOutlined style={{ marginRight: 8 }} />赛事规则</h2>
        <p>了解比赛规则和战力评级标准</p>
      </div>

      <Card className="rules-section" title={<span><ThunderboltOutlined style={{ marginRight: 8 }} />比赛规则</span>} style={{ marginBottom: 24 }}>
        <Table
          dataSource={[
            { key: '1', action: '参赛（每场比赛所有队员）', score: '场次 +1', icon: '🎮' },
            { key: '2', action: '赢一场', score: '胜场 +1', icon: '✅' },
            { key: '3', action: '赛事冠军队', score: '冠军 +1', icon: '🏆' },
          ]}
          columns={[
            { title: '', dataIndex: 'icon', width: 50, align: 'center' as const },
            { title: '行为', dataIndex: 'action', render: (t: string) => <span style={{ fontWeight: 500 }}>{t}</span> },
            { title: '变化', dataIndex: 'score', width: 130, align: 'center' as const, render: (t: string) => <Tag color="green" style={{ fontWeight: 600, fontSize: 13 }}>{t}</Tag> },
          ]}
          pagination={false}
          size="middle"
        />

        <div style={{ marginTop: 24, padding: '16px 20px', background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
          <h4 style={{ margin: '0 0 8px', color: '#d48806' }}><WarningOutlined style={{ marginRight: 6 }} />说明</h4>
          <ul style={{ lineHeight: 2.2, margin: 0, paddingLeft: 20, color: '#555' }}>
            <li>每场比赛结束后，<b>胜队全员</b>记录胜场，败队不受影响</li>
            <li>赛事全部结束后，<b>冠军队全员</b>冠军次数 +1</li>
            <li>战力评级由管理员根据综合表现手动评定</li>
            <li>评级不会自动变化，定期由管理员调整</li>
          </ul>
        </div>
      </Card>

      <Card className="rules-section" title={<span><StarOutlined style={{ marginRight: 8 }} />战力评级</span>}>
        <Row gutter={[12, 12]}>
          {ratingData.map((r, i) => (
            <Col xs={12} sm={6} key={r.rating}>
              <div style={{
                textAlign: 'center',
                padding: '16px 12px',
                borderRadius: 12,
                background: i < 3 ? `linear-gradient(135deg, ${r.color}10, ${r.color}05)` : '#fafafa',
                border: `1px solid ${i < 3 ? r.color + '30' : '#f0f0f0'}`,
                transition: 'transform 0.2s',
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{r.icon}</div>
                <Tag className={`rating-tag rating-${r.rating}`} style={{ fontSize: 18, padding: '4px 16px', marginBottom: 8 }}>{r.rating}</Tag>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>{r.desc}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
