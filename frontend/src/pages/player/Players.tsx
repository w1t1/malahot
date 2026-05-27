import { useEffect, useState } from 'react';
import { Table, Input, Avatar, Card, Tag } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import { playerApi } from '../../api/player';
import type { Player } from '../../api/player';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const ratingColors: Record<string, string> = {
  SSR: '#ff4d4f', SR: '#fa8c16', S: '#faad14',
  A: '#52c41a', B: '#1677ff', C: '#999',
  D: '#bbb', E: '#ddd',
};

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
      width: 80,
      render: (avatar: string | null) => (
        <Avatar src={avatar} icon={<UserOutlined />} />
      ),
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      render: (text: string) => text || '未设置昵称',
    },
    {
      title: '评级',
      dataIndex: 'rating',
      width: 80,
      render: (r: string) => <Tag color={ratingColors[r]}>{r}级</Tag>,
    },
    {
      title: '积分',
      dataIndex: 'score',
      width: 80,
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: '场次',
      dataIndex: 'matchesPlayed',
      width: 80,
    },
    {
      title: '胜率',
      width: 80,
      render: (_, r: Player) => r.matchesPlayed > 0 ? `${((r.wins / r.matchesPlayed) * 100).toFixed(1)}%` : '-',
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>选手名单</h2>
          <Input.Search
            placeholder="搜索选手昵称"
            allowClear
            onSearch={handleSearch}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
        </div>
        <Table
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
