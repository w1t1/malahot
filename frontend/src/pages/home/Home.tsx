import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Select, Empty, Spin, Avatar, Tabs, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { competitionApi } from '../../api/competition';
import { playerApi } from '../../api/player';
import type { Competition } from '../../api/competition';
import type { Player } from '../../api/player';
import { TrophyOutlined, TeamOutlined, CalendarOutlined, UserOutlined, FireOutlined, CrownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusMap: Record<string, { color: string; text: string }> = {
  DRAFT: { color: 'default', text: '草稿' },
  REGISTRATION: { color: 'blue', text: '报名中' },
  IN_PROGRESS: { color: 'orange', text: '进行中' },
  FINISHED: { color: 'green', text: '已结束' },
  CANCELLED: { color: 'red', text: '已取消' },
};

function RatingTag({ rating }: { rating: string }) {
  return <Tag className={`rating-tag rating-${rating}`}>{rating}级</Tag>;
}

function TopPlayerCard({ player, rank }: { player: Player; rank: number }) {
  const isFirst = rank === 1;
  const sizes = { avatar: isFirst ? 72 : 56, title: isFirst ? 20 : 15, rank: isFirst ? 32 : 22 };
  const medals = ['🥇', '🥈', '🥉'];
  const winRate = player.matchesPlayed > 0 ? ((player.wins / player.matchesPlayed) * 100).toFixed(1) : '0';

  return (
    <div className={`top-card top-card-${rank}`} style={{ padding: '20px 16px', borderRadius: 16, textAlign: 'center' }}>
      <div className="top-rank" style={{ fontSize: sizes.rank, marginBottom: 4 }}>
        {medals[rank - 1]} TOP {rank}
      </div>
      <Avatar
        src={player.avatar}
        icon={<UserOutlined />}
        size={sizes.avatar}
        className="top-avatar"
        style={{ margin: '8px 0', border: '3px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
      />
      <div className="top-name" style={{ fontSize: sizes.title, marginBottom: 6 }}>
        {player.nickname || '未命名'}
      </div>
      <div style={{ marginBottom: 6 }}><RatingTag rating={player.rating} /></div>
      <div className="top-stats" style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <span><CrownOutlined /> {player.championCount || 0}冠</span>
        <span>{player.matchesPlayed}场</span>
        <span>胜率 {winRate}%</span>
      </div>
    </div>
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
      title: '#', width: 60, align: 'center',
      render: (_, __, i) => {
        const n = i + 4;
        return <span className="player-rank-num player-rank-default">{n}</span>;
      },
    },
    {
      title: '选手', dataIndex: 'nickname',
      render: (text: string, record: Player) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Avatar src={record.avatar} icon={<UserOutlined />} size={32} />
          <span style={{ fontWeight: 500 }}>{text || '未命名'}</span>
        </span>
      ),
    },
    {
      title: '评级', dataIndex: 'rating', width: 90, align: 'center',
      render: (r: string) => <RatingTag rating={r} />,
    },
    {
      title: '冠军', dataIndex: 'championCount', width: 80, align: 'center',
      render: (c: number) => <span className="score-highlight">{c || 0}</span>,
    },
    { title: '场次', dataIndex: 'matchesPlayed', width: 70, align: 'center' },
    {
      title: '胜率', width: 80, align: 'center',
      render: (_, r: Player) => {
        if (r.matchesPlayed <= 0) return <span style={{ color: '#bbb' }}>-</span>;
        const rate = (r.wins / r.matchesPlayed) * 100;
        const color = rate >= 60 ? '#52c41a' : rate >= 40 ? '#faad14' : '#ff4d4f';
        return <span style={{ fontWeight: 600, color }}>{rate.toFixed(1)}%</span>;
      },
    },
  ];

  const tabItems = [
    {
      key: 'leaderboard',
      label: <span><FireOutlined /> 战力排行榜</span>,
      children: (
        <div>
          <div className="page-header" style={{ marginBottom: 24 }}>
            <h2><CrownOutlined style={{ marginRight: 8 }} />战力排行榜</h2>
            <p>竞技场上的最强王者，用实力书写传奇</p>
          </div>

          {top3.length > 0 && (
            <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
              {top3.length >= 2 && (
                <Col xs={24} sm={8}>
                  <div style={{ marginTop: 32 }}><TopPlayerCard player={top3[1]} rank={2} /></div>
                </Col>
              )}
              {top3.length >= 1 && (
                <Col xs={24} sm={8}><TopPlayerCard player={top3[0]} rank={1} /></Col>
              )}
              {top3.length >= 3 && (
                <Col xs={24} sm={8}>
                  <div style={{ marginTop: 32 }}><TopPlayerCard player={top3[2]} rank={3} /></div>
                </Col>
              )}
            </Row>
          )}

          {rest.length > 0 && (
            <Card style={{ borderRadius: 12, overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
              <Table
                className="leaderboard-table"
                columns={leaderColumns}
                dataSource={rest}
                rowKey="id"
                pagination={false}
                size="middle"
              />
            </Card>
          )}
          {leaderboard.length === 0 && <Empty description="暂无排行数据" style={{ padding: 60 }} />}
        </div>
      ),
    },
    {
      key: 'competitions',
      label: <span><TrophyOutlined /> 赛事大厅</span>,
      children: (
        <div>
          <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2><TrophyOutlined style={{ marginRight: 8 }} />赛事大厅</h2>
              <p>发现精彩赛事，组队参加竞技</p>
            </div>
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
              <Empty description="暂无赛事" style={{ padding: 60 }} />
            ) : (
              <Row gutter={[20, 20]}>
                {competitions.map((comp) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={comp.id}>
                    <Card
                      className="competition-card"
                      hoverable
                      onClick={() => navigate(`/competition/${comp.id}`)}
                      cover={
                        comp.coverImage ? (
                          <img alt={comp.title} src={comp.coverImage} style={{ height: 160, objectFit: 'cover' }} />
                        ) : (
                          <div className="competition-cover" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 60%, #e94560 100%)' }}>
                            <TrophyOutlined style={{ fontSize: 52, color: 'rgba(255,255,255,0.8)', zIndex: 1 }} />
                          </div>
                        )
                      }
                    >
                      <Card.Meta
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 15, fontWeight: 600 }}>{comp.title}</span>
                            <Tag color={statusMap[comp.status]?.color}>{statusMap[comp.status]?.text}</Tag>
                          </div>
                        }
                        description={
                          <div style={{ fontSize: 13, lineHeight: 2 }}>
                            <div><TrophyOutlined style={{ marginRight: 6 }} />{comp.gameType}</div>
                            <div><TeamOutlined style={{ marginRight: 6 }} />{comp.teamSize}人队伍 · 最多{comp.maxTeams}支</div>
                            <div><CalendarOutlined style={{ marginRight: 6 }} />{dayjs(comp.registrationEnd).format('MM-DD HH:mm')} 截止</div>
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

  return <Tabs className="home-tabs" defaultActiveKey="leaderboard" items={tabItems} size="large" />;
}
