import { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Empty, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { teamApi } from '../../api/team';
import type { Team } from '../../api/team';
import { useAuthStore } from '../../stores/auth';

export default function MyTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    teamApi.getMyTeams().then(res => {
      setTeams(res.data || []);
    }).catch(() => {
      message.error('加载失败');
    }).finally(() => setLoading(false));
  }, [isLoggedIn, navigate]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <Card title="我的战队">
      {teams.length === 0 ? (
        <Empty description="你还没有加入任何战队，去赛事大厅报名吧！">
          <Button type="primary" onClick={() => navigate('/')}>浏览赛事</Button>
        </Empty>
      ) : (
        <List
          dataSource={teams}
          renderItem={(team) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => navigate(`/team/${team.id}`)}>查看详情</Button>,
              ]}
            >
              <List.Item.Meta
                title={team.name}
                description={
                  <span>
                    邀请码: <strong>{team.inviteCode}</strong>
                    {' · '}
                    <Tag color={team.status === 'APPROVED' ? 'green' : team.status === 'PENDING' ? 'gold' : 'default'}>
                      {team.status === 'APPROVED' ? '已通过' : team.status === 'PENDING' ? '待审核' : team.status}
                    </Tag>
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
