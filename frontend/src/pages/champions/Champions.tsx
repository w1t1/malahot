import { useEffect, useState } from 'react';
import { Card, Empty, Spin, Row, Col } from 'antd';
import { TrophyOutlined, CrownOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { playerApi } from '../../api/player';
import type { ChampionRecord } from '../../api/player';
import dayjs from 'dayjs';

export default function Champions() {
  const [champions, setChampions] = useState<ChampionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    playerApi.champions()
      .then(res => setChampions(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 32, textAlign: 'center' }}>
        <h2><CrownOutlined style={{ marginRight: 8 }} />历届赛事冠军</h2>
        <p>荣耀殿堂，记录每一个冠军时刻</p>
      </div>

      <Spin spinning={loading}>
        {champions.length === 0 && !loading ? (
          <Empty description="暂无冠军记录" style={{ padding: 60 }} />
        ) : (
          <Row gutter={[24, 24]}>
            {champions.map((ch) => (
              <Col xs={24} sm={12} key={ch.id}>
                <Card
                  className="champion-card"
                  hoverable
                  style={{ height: '100%' }}
                  styles={{ body: { padding: '24px 28px' } }}
                >
                  <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <TrophyOutlined style={{ fontSize: 28, color: '#faad14', filter: 'drop-shadow(0 2px 4px rgba(250,173,20,0.4))' }} />
                    <span className="champion-season">{ch.seasonName}</span>
                  </div>

                  <div className="champion-team-name">
                    🏆 {ch.teamName}
                  </div>

                  {ch.captainName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555', marginBottom: 8, fontSize: 14 }}>
                      <UserOutlined style={{ color: '#faad14' }} />
                      <span>队长: <strong>{ch.captainName}</strong></span>
                    </div>
                  )}

                  {ch.members && (
                    <div style={{ color: '#888', fontSize: 13, lineHeight: 1.8, padding: '8px 12px', background: 'rgba(250,173,20,0.06)', borderRadius: 8 }}>
                      <TeamOutlined style={{ marginRight: 6 }} />
                      {ch.members}
                    </div>
                  )}

                  <div style={{ marginTop: 12, color: '#bbb', fontSize: 12, textAlign: 'right' }}>
                    {dayjs(ch.crownedAt).format('YYYY年MM月DD日')}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
}
