import { Card, Table, Tag, Row, Col } from 'antd';
import { FireOutlined, WarningOutlined, StarOutlined, ThunderboltOutlined } from '@ant-design/icons';

const ratingData = [
  { rating: 'SSR', min: 80, color: '#ff4d4f', desc: '传说' },
  { rating: 'SR', min: 60, color: '#fa8c16', desc: '史诗' },
  { rating: 'S', min: 45, color: '#faad14', desc: '精英' },
  { rating: 'A', min: 30, color: '#52c41a', desc: '高级' },
  { rating: 'B', min: 20, color: '#1677ff', desc: '中级' },
  { rating: 'C', min: 10, color: '#999', desc: '初级' },
  { rating: 'D', min: 5, color: '#bbb', desc: '入门' },
  { rating: 'E', min: 0, color: '#ddd', desc: '新手' },
];

export default function Rules() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 32, textAlign: 'center' }}>
        <h2><FireOutlined style={{ marginRight: 8 }} />积分规则</h2>
        <p>了解积分计算方式和评级标准</p>
      </div>

      <Card className="rules-section" title={<span><ThunderboltOutlined style={{ marginRight: 8 }} />积分获取规则</span>} style={{ marginBottom: 24 }}>
        <Table
          dataSource={[
            { key: '1', action: '参赛（每场比赛所有队员）', score: '场次 +1', icon: '🎮' },
            { key: '2', action: '赢一场', score: '积分 +1', icon: '✅' },
            { key: '3', action: '赛事冠军队（额外奖励）', score: '积分 +5', icon: '🏆' },
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
            <li>积分基于<b>个人</b>累计，不会因赛季重置</li>
            <li>每场比赛结束后，<b>胜队全员</b>积分 +1，败队不扣分</li>
            <li>赛事全部结束后，<b>冠军队全员</b>额外获得 +5 积分</li>
            <li>积分决定选手评级，评级会随积分自动更新</li>
          </ul>
        </div>
      </Card>

      <Card className="rules-section" title={<span><StarOutlined style={{ marginRight: 8 }} />评级标准</span>}>
        <Row gutter={[12, 12]}>
          {ratingData.map((r, i) => {
            const range = i === 0
              ? `≥ ${r.min} 分`
              : i === ratingData.length - 1
                ? `< ${ratingData[i - 1].min} 分`
                : `${r.min} ~ ${ratingData[i - 1].min - 1} 分`;
            return (
              <Col xs={12} sm={6} key={r.rating}>
                <div style={{
                  textAlign: 'center',
                  padding: '16px 12px',
                  borderRadius: 12,
                  background: i < 3 ? `linear-gradient(135deg, ${r.color}10, ${r.color}05)` : '#fafafa',
                  border: `1px solid ${i < 3 ? r.color + '30' : '#f0f0f0'}`,
                  transition: 'transform 0.2s',
                }}>
                  <Tag className={`rating-tag rating-${r.rating}`} style={{ fontSize: 18, padding: '4px 16px', marginBottom: 8 }}>{r.rating}</Tag>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 2 }}>{r.desc}</div>
                  <div style={{ color: '#999', fontSize: 12 }}>{range}</div>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>
    </div>
  );
}
