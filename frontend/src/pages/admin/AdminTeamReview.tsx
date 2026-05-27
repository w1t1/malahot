import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, Tag, Space, Card, message } from 'antd';
import { teamApi } from '../../api/team';
import type { Team } from '../../api/team';

export default function AdminTeamReview() {
  const { id } = useParams<{ id: string }>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const compId = Number(id);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await teamApi.getByCompetition(compId, { page: 1, size: 100 });
      setTeams((res as any).data?.records || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchTeams(); }, [compId]);

  const handleApprove = async (teamId: number) => {
    try {
      await teamApi.approve(teamId);
      message.success('已通过');
      fetchTeams();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const handleReject = async (teamId: number) => {
    try {
      await teamApi.reject(teamId);
      message.success('已拒绝');
      fetchTeams();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  return (
    <Card title="报名审核">
      <Table
        dataSource={teams}
        rowKey="id"
        loading={loading}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '战队名称', dataIndex: 'name' },
          { title: '邀请码', dataIndex: 'inviteCode' },
          {
            title: '状态', dataIndex: 'status',
            render: (s: string) => {
              const map: Record<string, { color: string; text: string }> = {
                PENDING: { color: 'gold', text: '待审核' },
                APPROVED: { color: 'green', text: '已通过' },
                REJECTED: { color: 'red', text: '已拒绝' },
              };
              return <Tag color={map[s]?.color}>{map[s]?.text || s}</Tag>;
            },
          },
          {
            title: '操作',
            render: (_: any, record: Team) =>
              record.status === 'PENDING' ? (
                <Space>
                  <Button type="primary" size="small" onClick={() => handleApprove(record.id)}>通过</Button>
                  <Button danger size="small" onClick={() => handleReject(record.id)}>拒绝</Button>
                </Space>
              ) : null,
          },
        ]}
      />
    </Card>
  );
}
