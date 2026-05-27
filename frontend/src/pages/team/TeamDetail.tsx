import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Spin, message, Button } from 'antd';
import { teamApi } from '../../api/team';
import type { TeamDetail as TeamDetailType } from '../../api/team';
import { useAuthStore } from '../../stores/auth';
import { UserOutlined, CrownOutlined } from '@ant-design/icons';

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<TeamDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuthStore();

  useEffect(() => {
    teamApi.getDetail(Number(id))
      .then(res => setDetail(res.data))
      .catch(() => message.error('加载失败'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!detail) return null;

  const { team, members } = detail;
  const isMember = members.some(m => m.userId === userId);
  const isCaptain = team.captainId === userId;

  const handleLeave = async () => {
    try {
      await teamApi.leave(team.id);
      message.success('已离开战队');
      window.location.reload();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  return (
    <Card title={`战队: ${team.name}`} extra={
      isMember && !isCaptain ? <Button danger onClick={handleLeave}>离开战队</Button> : null
    }>
      <Descriptions bordered column={2}>
        <Descriptions.Item label="战队名称">{team.name}</Descriptions.Item>
        <Descriptions.Item label="邀请码"><strong>{team.inviteCode}</strong>（分享给队友加入）</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={team.status === 'APPROVED' ? 'green' : team.status === 'PENDING' ? 'gold' : 'default'}>
            {team.status}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <h3 style={{ marginTop: 24 }}>队员列表</h3>
      <Table
        dataSource={members}
        rowKey="userId"
        pagination={false}
        columns={[
          {
            title: '角色',
            dataIndex: 'role',
            render: (role: string) => role === 'CAPTAIN'
              ? <Tag icon={<CrownOutlined />} color="gold">队长</Tag>
              : <Tag icon={<UserOutlined />}>队员</Tag>,
          },
          { title: '昵称', dataIndex: 'nickname' },
        ]}
      />
    </Card>
  );
}
