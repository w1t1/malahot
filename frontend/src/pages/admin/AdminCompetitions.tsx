import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { competitionApi } from '../../api/competition';
import type { Competition } from '../../api/competition';
import { useAuthStore } from '../../stores/auth';
import dayjs from 'dayjs';

const statusMap: Record<string, { color: string; text: string }> = {
  DRAFT: { color: 'default', text: '草稿' },
  REGISTRATION: { color: 'blue', text: '报名中' },
  IN_PROGRESS: { color: 'orange', text: '进行中' },
  FINISHED: { color: 'green', text: '已结束' },
  CANCELLED: { color: 'red', text: '已取消' },
};

export default function AdminCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { role } = useAuthStore();

  useEffect(() => {
    if (role !== 'ADMIN') { navigate('/'); return; }
    fetchData();
  }, [role, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await competitionApi.list({ page: 1, size: 50 });
      setCompetitions(res.data.records);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await competitionApi.updateStatus(id, status);
      message.success('状态更新成功');
      fetchData();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '赛事名称', dataIndex: 'title' },
    { title: '游戏类型', dataIndex: 'gameType' },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
    { title: '报名截止', dataIndex: 'registrationEnd', render: (t: string) => dayjs(t).format('MM-DD HH:mm') },
    {
      title: '操作',
      render: (_: any, record: Competition) => (
        <Space>
          {record.status === 'DRAFT' && (
            <>
              <Button type="link" onClick={() => navigate(`/admin/competitions/${record.id}/edit`)}>编辑</Button>
              <Button type="link" onClick={() => handleStatusChange(record.id, 'REGISTRATION')}>发布报名</Button>
            </>
          )}
          {record.status === 'REGISTRATION' && (
            <>
              <Button type="link" onClick={() => navigate(`/admin/competitions/${record.id}/teams`)}>审核报名</Button>
              <Button type="link" onClick={() => handleStatusChange(record.id, 'IN_PROGRESS')}>开始比赛</Button>
            </>
          )}
          {record.status === 'IN_PROGRESS' && (
            <Button type="link" onClick={() => navigate(`/admin/competitions/${record.id}/matches`)}>管理赛程</Button>
          )}
          {record.status !== 'FINISHED' && record.status !== 'CANCELLED' && (
            <Button type="link" danger onClick={() => handleStatusChange(record.id, 'CANCELLED')}>取消</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="赛事管理"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/competitions/new')}>创建赛事</Button>}
    >
      <Table dataSource={competitions} columns={columns} rowKey="id" loading={loading} />
    </Card>
  );
}
