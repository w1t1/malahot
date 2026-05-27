import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, Tag, Card, message, Modal, Form, InputNumber } from 'antd';
import { matchApi, teamApi, rankingApi } from '../../api/team';
import type { MatchRecord, Team, Ranking } from '../../api/team';

export default function AdminMatchManage() {
  const { id } = useParams<{ id: string }>();
  const compId = Number(id);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultModal, setResultModal] = useState<{ visible: boolean; matchId: number | null }>({ visible: false, matchId: null });
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const teamsRes = await teamApi.getByCompetition(compId, { page: 1, size: 100 });
      setTeams((teamsRes as any).data?.records || []);

      try {
        const matchRes = await matchApi.getByCompetition(compId);
        setMatches(matchRes.data || []);
      } catch { setMatches([]); }

      try {
        const rankRes = await rankingApi.getByCompetition(compId);
        setRankings(rankRes.data || []);
      } catch { setRankings([]); }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [compId]);

  const teamNameMap = teams.reduce((acc, t) => ({ ...acc, [t.id]: t.name }), {} as Record<number, string>);

  const handleGenerate = async () => {
    try {
      await matchApi.generateBracket(compId);
      message.success('对阵表生成成功');
      fetchData();
    } catch (e: any) {
      message.error(e.message || '生成失败');
    }
  };

  const handleSubmitResult = async (values: { scoreA: number; scoreB: number }) => {
    if (!resultModal.matchId) return;
    try {
      await matchApi.submitResult(resultModal.matchId, values);
      message.success('结果提交成功');
      setResultModal({ visible: false, matchId: null });
      form.resetFields();
      fetchData();
    } catch (e: any) {
      message.error(e.message || '提交失败');
    }
  };

  return (
    <div>
      <Card title="赛程管理" extra={
        matches.length === 0 ? (
          <Button type="primary" onClick={handleGenerate}>生成对阵表</Button>
        ) : null
      }>
        <Table
          dataSource={matches}
          rowKey="id"
          loading={loading}
          columns={[
            { title: '轮次', dataIndex: 'round', render: (r: number) => `第${r}轮` },
            { title: '场次', dataIndex: 'matchOrder' },
            { title: '队伍A', dataIndex: 'teamAId', render: (id: number) => teamNameMap[id] || (id ? `#${id}` : '待定') },
            { title: '比分', render: (_: any, r: MatchRecord) => r.scoreA != null ? `${r.scoreA} : ${r.scoreB}` : '-' },
            { title: '队伍B', dataIndex: 'teamBId', render: (id: number) => teamNameMap[id] || (id ? `#${id}` : '待定') },
            { title: '获胜方', dataIndex: 'winnerId', render: (id: number) => id ? (teamNameMap[id] || `#${id}`) : '-' },
            {
              title: '状态', dataIndex: 'status',
              render: (s: string) => s === 'FINISHED' ? <Tag color="green">已结束</Tag> : <Tag>待比赛</Tag>,
            },
            {
              title: '操作',
              render: (_: any, record: MatchRecord) =>
                record.status !== 'FINISHED' && record.teamAId && record.teamBId ? (
                  <Button type="link" onClick={() => setResultModal({ visible: true, matchId: record.id })}>
                    录入结果
                  </Button>
                ) : null,
            },
          ]}
        />
      </Card>

      {rankings.length > 0 && (
        <Card title="当前排名" style={{ marginTop: 16 }}>
          <Table
            dataSource={rankings}
            rowKey="id"
            pagination={false}
            columns={[
              { title: '排名', dataIndex: 'rankPosition', render: (r: number | null) => r || '-' },
              { title: '战队', dataIndex: 'teamId', render: (id: number) => teamNameMap[id] || `#${id}` },
              { title: '胜', dataIndex: 'wins' },
              { title: '负', dataIndex: 'losses' },
              { title: '积分', dataIndex: 'points' },
            ]}
          />
        </Card>
      )}

      <Modal title="录入比赛结果" open={resultModal.visible}
        onCancel={() => { setResultModal({ visible: false, matchId: null }); form.resetFields(); }}
        footer={null}>
        <Form form={form} onFinish={handleSubmitResult} layout="inline">
          <Form.Item name="scoreA" label="队伍A得分" rules={[{ required: true }]}>
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="scoreB" label="队伍B得分" rules={[{ required: true }]}>
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">提交</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
