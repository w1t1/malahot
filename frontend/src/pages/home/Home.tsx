import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Select, Empty, Spin, Avatar, Tabs, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { competitionApi } from '../../api/competition';
import { playerApi } from '../../api/player';
import type { Competition } from '../../api/competition';
import type { Player } from '../../api/player';
import { TrophyOutlined, TeamOutlined, CalendarOutlined, UserOutlined, FireOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusMap: Record<string, { color: string; text: string }> = {
  DRAFT: { color: 'default', text: '草稿' },
  REGISTRATION: { color: 'blue', text: '报名中' },
  IN_PROGRESS: { color: 'orange', text: '进行中' },
  FINISHED: { color: 'green', text: '已结束' },
  CANCELLED: { color: 'red', text: '已取消' },
};

const ratingColors: Record<string, string> = {
  SSR: '#ff4d4f', SR: '#fa8c16', S: '#faad14',
  A: '#52c41a', B: '#1677ff', C: '#999',
  D: '#bbb', E: '#ddd',
};

function TopPlayerCard({ player, rank }: { player: Player; rank: number }) {
  const isFirst = rank === 1;
  const heights = [180, 150, 150];
  const badges = ['👑', '', ''];
  const bgColors = [
    'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    'linear-gradient(135deg, #c0c0c0 0%, #8e8e8e 100%)',
    'linear-gradient(135deg, #cd7f32 0%, #8b4513 100%)',
  ];

  return (
    <Card
      style={{ textAlign: 'center', height: heights[rank - 1], borderRadius: 12, overflow: 'hidden' }}
      styles={{ body: { padding: '16px 12px', background: bgColors[rank - 1] } }}
    >
      <div style={{ fontSize: isFirst ? 28 : 20 }}>{badges[rank - 1]} TOP {rank}</div>
      <Avatar src={player.avatar} icon={<UserOutlined />} size={isFirst ? 64 : 48} style={{ margin: '8px 0', border: '2px solid #fff' }} />
      <div style={{ color: '#fff', fontWeight: 'bold', fontSize: isFirst ? 18 : 14 }}>
        {player.nickname || '未命名'}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 4 }}>
        <Tag color={ratingColors[player.rating]} style={{ borderRadius: 4 }}>{player.rating}级</Tag>
        {player.score}分 | {player.matchesPlayed}场 | 胜率 {player.matchesPlayed > 0 ? ((player.wins / player.matchesPlayed) * 100).toFixed(1) : 0}%
      </div>
    </Card>
  );
}

export default function Home() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    playerApi.leaderboard(50).then(res => setLeaderboard(res.data)).catch(() => {});
  }, []);

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const res = await competitionApi.list({ page: 1, size: 20, status: status || undefined });
      setCompetitions(res.data.records);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, [status]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const leaderColumns: ColumnsType<Player> = [
    {
      title: '#', width: 50,
      render: (_, __, i) => <span style={{ fontWeight: 'bold' }}>{i + 4}</span>,
    },
    {
      title: '选手', dataIndex: 'nickname',
      render: (text: string, record: Player) => (
        <span><Avatar src={record.avatar} icon={<UserOutlined />} size="small" style={{ marginRight: 8 }} />{text || '未命名'}</span>
      ),
    },
    {
      title: '评级', dataIndex: 'rating', width: 80,
      render: (r: string) => <Tag color={ratingColors[r]}>{r}级</Tag>,
    },
    { title: '积分', dataIndex: 'score', width: 70, render: (s: number) => <span style={{ fontWeight: 'bold' }}>{s}</span> },
    { title: '场次', dataIndex: 'matchesPlayed', width: 70 },
    {
      title: '胜率', width: 80,
      render: (_, r: Player) => r.matchesPlayed > 0 ? `${((r.wins / r.matchesPlayed) * 100).toFixed(1)}%` : '-',
    },
  ];

  const tabItems = [
    {
      key: 'leaderboard',
      label: <span><FireOutlined /> 积分排行榜</span>,
      children: (
        <div>
          {top3.length > 0 && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              {top3.length >= 2 && (
                <Col xs={24} sm={8}><div style={{ marginTop: 30 }}><TopPlayerCard player={top3[1]} rank={2} /></div></Col>
              )}
              {top3.length >= 1 && (
                <Col xs={24} sm={8}><TopPlayerCard player={top3[0]} rank={1} /></Col>
              )}
              {top3.length >= 3 && (
                <Col xs={24} sm={8}><div style={{ marginTop: 30 }}><TopPlayerCard player={top3[2]} rank={3} /></div></Col>
              )}
            </Row>
          )}
          {rest.length > 0 && (
            <Table columns={leaderColumns} dataSource={rest} rowKey="id" pagination={false} size="small" />
          )}
          {leaderboard.length === 0 && <Empty description="暂无积分数据" />}
        </div>
      ),
    },
    {
      key: 'competitions',
      label: <span><TrophyOutlined /> 赛事大厅</span>,
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Select
              placeholder="按状态筛选"
              allowClear
              style={{ width: 150 }}
              onChange={(v) => setStatus(v || '')}
              options={[
                { label: '报名中', value: 'REGISTRATION' },
                { label: '进行中', value: 'IN_PROGRESS' },
                { label: '已结束', value: 'FINISHED' },
              ]}
            />
          </div>
          <Spin spinning={loading}>
            {competitions.length === 0 && !loading ? (
              <Empty description="暂无赛事" />
            ) : (
              <Row gutter={[16, 16]}>
                {competitions.map((comp) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={comp.id}>
                    <Card
                      hoverable
                      onClick={() => navigate(`/competition/${comp.id}`)}
                      cover={
                        comp.coverImage ? (
                          <img alt={comp.title} src={comp.coverImage} style={{ height: 160, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ height: 160, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrophyOutlined style={{ fontSize: 48, color: '#fff' }} />
                          </div>
                        )
                      }
                    >
                      <Card.Meta
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{comp.title}</span>
                            <Tag color={statusMap[comp.status]?.color}>{statusMap[comp.status]?.text}</Tag>
                          </div>
                        }
                        description={
                          <div>
                            <div><TrophyOutlined /> {comp.gameType}</div>
                            <div><TeamOutlined /> {comp.teamSize}人队伍 · 最多{comp.maxTeams}支</div>
                            <div><CalendarOutlined /> {dayjs(comp.registrationEnd).format('MM-DD HH:mm')} 截止报名</div>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Spin>
        </div>
      ),
    },
  ];

  return <Tabs defaultActiveKey="leaderboard" items={tabItems} size="large" />;
}
