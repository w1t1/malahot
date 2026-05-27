import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Select, Empty, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { competitionApi } from '../../api/competition';
import type { Competition } from '../../api/competition';
import { TrophyOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const statusMap: Record<string, { color: string; text: string }> = {
  DRAFT: { color: 'default', text: '草稿' },
  REGISTRATION: { color: 'blue', text: '报名中' },
  IN_PROGRESS: { color: 'orange', text: '进行中' },
  FINISHED: { color: 'green', text: '已结束' },
  CANCELLED: { color: 'red', text: '已取消' },
};

export default function Home() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('');
  const navigate = useNavigate();

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

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
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
  );
}
