import { useEffect, useState } from 'react';
import { Card, Empty, Timeline } from 'antd';
import { TrophyOutlined, CrownOutlined, TeamOutlined } from '@ant-design/icons';
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
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card title={<span><CrownOutlined style={{ color: '#faad14' }} /> 历届赛事冠军</span>} loading={loading}>
        {champions.length === 0 ? (
          <Empty description="暂无冠军记录" />
        ) : (
          <Timeline
            items={champions.map(ch => ({
              color: 'gold',
              dot: <TrophyOutlined style={{ fontSize: 20, color: '#faad14' }} />,
              children: (
                <Card size="small" style={{ background: 'linear-gradient(135deg, #fff9e6 0%, #fff 100%)' }}>
                  <h3 style={{ margin: '0 0 8px' }}>
                    <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    {ch.seasonName}
                  </h3>
                  <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                    🏆 {ch.teamName}
                  </div>
                  {ch.captainName && (
                    <div style={{ color: '#666' }}>
                      <TeamOutlined /> 队长: {ch.captainName}
                    </div>
                  )}
                  {ch.members && (
                    <div style={{ color: '#999', marginTop: 4 }}>
                      队员: {ch.members}
                    </div>
                  )}
                  <div style={{ color: '#bbb', marginTop: 8, fontSize: 12 }}>
                    {dayjs(ch.crownedAt).format('YYYY年MM月DD日')}
                  </div>
                </Card>
              ),
            }))}
          />
        )}
      </Card>
    </div>
  );
}
