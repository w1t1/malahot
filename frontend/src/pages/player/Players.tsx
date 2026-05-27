import { useEffect, useState } from 'react';
import { Table, Input, Avatar, Card, Tag } from 'antd';
import { UserOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import { playerApi } from '../../api/player';
import type { Player } from '../../api/player';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

function RatingTag({ rating }: { rating: string }) {
  return <Tag className={`rating-tag rating-${rating}`}>{rating}级</Tag>;
}

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const fetchPlayers = async (p: number, kw: string) => {
    setLoading(true);
    try {
      const res = await playerApi.list(p, 20, kw || undefined);
      setPlayers(res.data.records);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers(page, keyword);
  }, [page]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
    fetchPlayers(1, value);
  };

  const columns: ColumnsType<Player> = [
    {
      title: '头像',
      dataIndex: 'avatar',
      width: 70,
      align: 'center',
      render: (avatar: string | null) => (
        <Avatar src={avatar} icon={<UserOutlined />} size={36} style={{ border: '2px solid #f0f0f0' }} />
      ),
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text || '未设置昵称'}</span>,
    },
    {
      title: '评级',
      dataIndex: 'rating',
      width: 90,
      align: 'center',
      render: (r: string) => <RatingTag rating={r} />,
    },
    {
      title: '积分',
      dataIndex: 'score',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.score - b.score,
      render: (s: number) => <span className="score-highlight">{s}</span>,
    },
    {
      title: '场次',
      dataIndex: 'matchesPlayed',
      width: 80,
      align: 'center',
    },
    {
      title: '胜率',
      width: 80,
      align: 'center',
      render: (_, r: Player) => {
        if (r.matchesPlayed <= 0) return <span style={{ color: '#bbb' }}>-</span>;
        const rate = (r.wins / r.matchesPlayed) * 100;
        const color = rate >= 60 ? '#52c41a' : rate >= 40 ? '#faad14' : '#ff4d4f';
        return <span style={{ fontWeight: 600, color }}>{rate.toFixed(1)}%</span>;
      },
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (text: string) => <span style={{ color: '#999' }}>{dayjs(text).format('YYYY-MM-DD HH:mm')}</span>,
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h2><TeamOutlined style={{ marginRight: 8 }} />选手名单</h2>
        <p>所有注册选手的积分与战绩一览</p>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Input.Search
            placeholder="搜索选手昵称"
            allowClear
            onSearch={handleSearch}
            style={{ width: 280 }}
            prefix={<SearchOutlined style={{ color: '#bbb' }} />}
          />
        </div>
        <Table
          className="leaderboard-table"
          columns={columns}
          dataSource={players}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            total,
            pageSize: 20,
            onChange: setPage,
            showTotal: (t) => `共 ${t} 名选手`,
          }}
        />
      </Card>
    </div>
  );
}
