import { Card, Table, Tag } from 'antd';
import { TrophyOutlined, FireOutlined, WarningOutlined } from '@ant-design/icons';

const ratingData = [
  { rating: 'SSR', min: 80, color: '#ff4d4f' },
  { rating: 'SR', min: 60, color: '#fa8c16' },
  { rating: 'S', min: 45, color: '#faad14' },
  { rating: 'A', min: 30, color: '#52c41a' },
  { rating: 'B', min: 20, color: '#1677ff' },
  { rating: 'C', min: 10, color: '#999' },
  { rating: 'D', min: 5, color: '#bbb' },
  { rating: 'E', min: 0, color: '#ddd' },
];

export default function Rules() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card title={<span><FireOutlined /> 赛事积分规则</span>} style={{ marginBottom: 24 }}>
        <h3><TrophyOutlined /> 常规赛事</h3>
        <Table
          dataSource={[
            { key: '1', action: '参赛（每场比赛所有队员）', score: '场次 +1' },
            { key: '2', action: '赢一场', score: '积分 +1' },
            { key: '3', action: '赛事冠军队（额外奖励）', score: '积分 +5' },
          ]}
          columns={[
            { title: '行为', dataIndex: 'action' },
            { title: '变化', dataIndex: 'score', width: 150, render: (t: string) => <Tag color="green">{t}</Tag> },
          ]}
          pagination={false}
          size="small"
        />

        <h3 style={{ marginTop: 24 }}><WarningOutlined /> 说明</h3>
        <ul style={{ lineHeight: 2 }}>
          <li>积分基于<b>个人</b>累计，不会因赛季重置</li>
          <li>每场比赛结束后，<b>胜队全员</b>积分 +1，败队不扣分</li>
          <li>赛事全部结束后，<b>冠军队全员</b>额外获得 +5 积分</li>
          <li>积分决定选手评级，评级会随积分自动更新</li>
        </ul>
      </Card>

      <Card title="评级标准">
        <Table
          dataSource={ratingData.map((r, i) => ({
            key: i,
            ...r,
            range: i === 0
              ? `≥ ${r.min} 分`
              : i === ratingData.length - 1
                ? `< ${ratingData[i - 1].min} 分`
                : `${r.min} ~ ${ratingData[i - 1].min - 1} 分`,
          }))}
          columns={[
            {
              title: '评级', dataIndex: 'rating', width: 100,
              render: (r: string, record: any) => <Tag color={record.color} style={{ fontWeight: 'bold', fontSize: 16 }}>{r}</Tag>,
            },
            { title: '积分范围', dataIndex: 'range' },
          ]}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
