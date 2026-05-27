import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Select, DatePicker, Button, Card, message, Spin } from 'antd';
import { competitionApi } from '../../api/competition';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function AdminCompetitionEdit() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      competitionApi.getById(Number(id)).then(res => {
        const comp = res.data;
        form.setFieldsValue({
          title: comp.title,
          gameType: comp.gameType,
          description: comp.description,
          rules: comp.rules,
          maxTeams: comp.maxTeams,
          teamSize: comp.teamSize,
          format: comp.format,
          registrationRange: [dayjs(comp.registrationStart), dayjs(comp.registrationEnd)],
          competitionStart: comp.competitionStart ? dayjs(comp.competitionStart) : undefined,
        });
      }).catch(() => message.error('加载失败'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, form]);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const data = {
        title: values.title,
        gameType: values.gameType,
        description: values.description,
        rules: values.rules,
        maxTeams: values.maxTeams,
        teamSize: values.teamSize,
        format: values.format || 'SINGLE_ELIMINATION',
        registrationStart: values.registrationRange[0].format('YYYY-MM-DDTHH:mm:ss'),
        registrationEnd: values.registrationRange[1].format('YYYY-MM-DDTHH:mm:ss'),
        competitionStart: values.competitionStart?.format('YYYY-MM-DDTHH:mm:ss'),
      };

      if (isEdit) {
        await competitionApi.update(Number(id), data);
        message.success('更新成功');
      } else {
        await competitionApi.create(data);
        message.success('创建成功');
      }
      navigate('/admin/competitions');
    } catch (e: any) {
      message.error(e.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <Card title={isEdit ? '编辑赛事' : '创建赛事'}>
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 600 }}
        initialValues={{ maxTeams: 16, teamSize: 5, format: 'SINGLE_ELIMINATION' }}>
        <Form.Item name="title" label="赛事名称" rules={[{ required: true }]}>
          <Input placeholder="例如: 2026 英雄联盟春季杯" />
        </Form.Item>
        <Form.Item name="gameType" label="游戏类型" rules={[{ required: true }]}>
          <Select placeholder="选择游戏" options={[
            { label: '英雄联盟', value: '英雄联盟' },
            { label: 'CS2', value: 'CS2' },
            { label: 'DOTA2', value: 'DOTA2' },
            { label: '王者荣耀', value: '王者荣耀' },
            { label: 'VALORANT', value: 'VALORANT' },
            { label: '其他', value: '其他' },
          ]} />
        </Form.Item>
        <Form.Item name="format" label="赛制">
          <Select options={[
            { label: '单淘汰', value: 'SINGLE_ELIMINATION' },
            { label: '双淘汰', value: 'DOUBLE_ELIMINATION' },
            { label: '小组赛', value: 'GROUP_STAGE' },
          ]} />
        </Form.Item>
        <Form.Item name="maxTeams" label="最大队伍数" rules={[{ required: true }]}>
          <InputNumber min={2} max={128} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="teamSize" label="每队人数" rules={[{ required: true }]}>
          <InputNumber min={1} max={10} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="registrationRange" label="报名时间" rules={[{ required: true, message: '请选择报名时间段' }]}>
          <RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="competitionStart" label="比赛开始时间">
          <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="description" label="赛事描述">
          <TextArea rows={4} placeholder="赛事简介..." />
        </Form.Item>
        <Form.Item name="rules" label="赛事规则">
          <TextArea rows={6} placeholder="详细规则..." />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} style={{ marginRight: 8 }}>
            {isEdit ? '保存' : '创建'}
          </Button>
          <Button onClick={() => navigate('/admin/competitions')}>取消</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
