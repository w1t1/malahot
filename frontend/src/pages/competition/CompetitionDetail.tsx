import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Tag, Tabs, Table, Button, Card, Spin, Modal, Form, Input, message, Empty } from 'antd';
import { competitionApi } from '../../api/competition';
import type { Competition } from '../../api/competition';
import { teamApi, matchApi, rankingApi } from '../../api/team';
import type { Team, MatchRecord, Ranking } from '../../api/team';
import { useAuthStore } from '../../stores/auth';
import dayjs from 'dayjs';

const statusMap: Record<string, { color: string; text: string }> = {
  DRAFT: { color: 'default', text: '草稿' },
  REGISTRATION: { color: 'blue', text: '报名中' },
  IN_PROGRESS: { color: 'orange', text: '进行中' },
  FINISHED: { color: 'green', text: '已结束' },
  CANCELLED: { color: 'red', text: '已取消' },
};

const teamStatusMap: Record<string, { color: string; text: string }> = {
  PENDING: { color: 'gold', text: '待审核' },
  APPROVED: { color: 'green', text: '已通过' },
  REJECTED: { color: 'red', text: '已拒绝' },
  ELIMINATED: { color: 'default', text: '已淘汰' },
  CHAMPION: { color: 'gold', text: '冠军' },
};

export default function CompetitionDetail() {
  const { id } = useParams<{ id: string }>();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTeamVisible, setCreateTeamVisible] = useState(false);
  const [joinTeamVisible, setJoinTeamVisible] = useState(false);
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [joinForm] = Form.useForm();

  const compId = Number(id);

  const fetchData = async () => {
    setLoading(true);
    try {
      const compRes = await competitionApi.getById(compId);
      setCompetition(compRes.data);

      const teamsRes = await teamApi.getByCompetition(compId, { page: 1, size: 100 });
      setTeams((teamsRes as any).data?.records || []);

      try {
        const matchRes = await matchApi.getByCompetition(compId);
        setMatches(matchRes.data || []);
      } catch { /* no matches yet */ }

      try {
        const rankRes = await rankingApi.getByCompetition(compId);
        setRankings(rankRes.data || []);
      } catch { /* no rankings yet */ }
    } catch {
      message.error('加载赛事信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [compId]);

  const teamNameMap = teams.reduce((acc, t) => ({ ...acc, [t.id]: t.name }), {} as Record<number, string>);

  const handleCreateTeam = async (values: { name: string }) => {
    try {
      await teamApi.create({ name: values.name, competitionId: compId });
      message.success('创建战队成功');
      setCreateTeamVisible(false);
      form.resetFields();
      fetchData();
    } catch (e: any) {
      message.error(e.message || '创建失败');
    }
  };

  const handleJoinTeam = async (values: { inviteCode: string }) => {
    try {
      await teamApi.join(values.inviteCode);
      message.success('加入战队成功');
      setJoinTeamVisible(false);
      joinForm.resetFields();
      fetchData();
    } catch (e: any) {
      message.error(e.message || '加入失败');
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!competition) return <Empty description="赛事不存在" />;

  const isRegistration = competition.status === 'REGISTRATION';

  const tabItems = [
    {
      key: 'info',
      label: '赛事信息',
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="赛事名称">{competition.title}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusMap[competition.status]?.color}>{statusMap[competition.status]?.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="游戏类型">{competition.gameType}</Descriptions.Item>
          <Descriptions.Item label="赛制">{competition.format === 'SINGLE_ELIMINATION' ? '单淘汰' : competition.format}</Descriptions.Item>
          <Descriptions.Item label="队伍规模">{competition.teamSize}人/队</Descriptions.Item>
          <Descriptions.Item label="最大队伍数">{competition.maxTeams}</Descriptions.Item>
          <Descriptions.Item label="报名时间" span={2}>
            {dayjs(competition.registrationStart).format('YYYY-MM-DD HH:mm')} ~ {dayjs(competition.registrationEnd).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          {competition.competitionStart && (
            <Descriptions.Item label="比赛开始" span={2}>{dayjs(competition.competitionStart).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          )}
          <Descriptions.Item label="赛事描述" span={2}>{competition.description || '暂无描述'}</Descriptions.Item>
          <Descriptions.Item label="赛事规则" span={2}><pre style={{ whiteSpace: 'pre-wrap' }}>{competition.rules || '暂无规则'}</pre></Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'teams',
      label: `参赛队伍 (${teams.length})`,
      children: (
        <div>
          {isLoggedIn && isRegistration && (
            <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
              <Button type="primary" onClick={() => setCreateTeamVisible(true)}>创建战队</Button>
              <Button onClick={() => setJoinTeamVisible(true)}>通过邀请码加入</Button>
            </div>
          )}
          <Table
            dataSource={teams}
            rowKey="id"
            columns={[
              { title: '战队名称', dataIndex: 'name' },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={teamStatusMap[s]?.color}>{teamStatusMap[s]?.text}</Tag> },
              { title: '创建时间', dataIndex: 'createdAt', render: (t: string) => dayjs(t).format('MM-DD HH:mm') },
              { title: '操作', render: (_: any, record: Team) => <Button type="link" onClick={() => navigate(`/team/${record.id}`)}>详情</Button> },
            ]}
            pagination={false}
          />
        </div>
      ),
    },
    {
      key: 'bracket',
      label: '对阵表',
      children: matches.length === 0 ? <Empty description="对阵表尚未生成" /> : (
        <Table
          dataSource={matches}
          rowKey="id"
          columns={[
            { title: '轮次', dataIndex: 'round', render: (r: number) => `第${r}轮` },
            { title: '场次', dataIndex: 'matchOrder' },
            { title: '队伍A', dataIndex: 'teamAId', render: (id: number) => teamNameMap[id] || (id ? `队伍${id}` : '待定') },
            { title: '比分', render: (_: any, r: MatchRecord) => r.scoreA != null ? `${r.scoreA} : ${r.scoreB}` : '-' },
            { title: '队伍B', dataIndex: 'teamBId', render: (id: number) => teamNameMap[id] || (id ? `队伍${id}` : '待定') },
            { title: '获胜方', dataIndex: 'winnerId', render: (id: number) => teamNameMap[id] || (id ? `队伍${id}` : '-') },
            { title: '状态', dataIndex: 'status', render: (s: string) => s === 'FINISHED' ? <Tag color="green">已结束</Tag> : s === 'IN_PROGRESS' ? <Tag color="orange">进行中</Tag> : <Tag>待开始</Tag> },
          ]}
          pagination={false}
        />
      ),
    },
    {
      key: 'ranking',
      label: '排名',
      children: rankings.length === 0 ? <Empty description="暂无排名数据" /> : (
        <Table
          dataSource={rankings}
          rowKey="id"
          columns={[
            { title: '排名', dataIndex: 'rankPosition', render: (r: number | null) => r || '-' },
            { title: '战队', dataIndex: 'teamId', render: (id: number) => teamNameMap[id] || `队伍${id}` },
            { title: '胜', dataIndex: 'wins' },
            { title: '负', dataIndex: 'losses' },
            { title: '积分', dataIndex: 'points' },
          ]}
          pagination={false}
        />
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Tabs items={tabItems} />
      </Card>

      <Modal title="创建战队" open={createTeamVisible} onCancel={() => setCreateTeamVisible(false)} footer={null}>
        <Form form={form} onFinish={handleCreateTeam}>
          <Form.Item name="name" rules={[{ required: true, message: '请输入战队名称' }]}>
            <Input placeholder="战队名称" maxLength={50} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>创建</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="通过邀请码加入" open={joinTeamVisible} onCancel={() => setJoinTeamVisible(false)} footer={null}>
        <Form form={joinForm} onFinish={handleJoinTeam}>
          <Form.Item name="inviteCode" rules={[{ required: true, message: '请输入邀请码' }]}>
            <Input placeholder="邀请码" maxLength={20} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>加入</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
