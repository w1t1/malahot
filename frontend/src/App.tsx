import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppLayout from './components/AppLayout';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import CompetitionDetail from './pages/competition/CompetitionDetail';
import MyTeams from './pages/team/MyTeams';
import TeamDetail from './pages/team/TeamDetail';
import AdminCompetitions from './pages/admin/AdminCompetitions';
import AdminCompetitionEdit from './pages/admin/AdminCompetitionEdit';
import AdminTeamReview from './pages/admin/AdminTeamReview';
import AdminMatchManage from './pages/admin/AdminMatchManage';

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1677ff' } }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="competition/:id" element={<CompetitionDetail />} />
            <Route path="my-teams" element={<MyTeams />} />
            <Route path="team/:id" element={<TeamDetail />} />
            <Route path="admin/competitions" element={<AdminCompetitions />} />
            <Route path="admin/competitions/new" element={<AdminCompetitionEdit />} />
            <Route path="admin/competitions/:id/edit" element={<AdminCompetitionEdit />} />
            <Route path="admin/competitions/:id/teams" element={<AdminTeamReview />} />
            <Route path="admin/competitions/:id/matches" element={<AdminMatchManage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
