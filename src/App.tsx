import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import BoardPage from '@/pages/BoardPage'
import RecruitmentDetailPage from '@/pages/RecruitmentDetailPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import MyPage from '@/pages/mypage/MyPage'
import AccountSettingsPage from '@/pages/mypage/AccountSettingsPage'
import MyRecruitmentsPage from '@/pages/mypage/MyRecruitmentsPage'
import NotificationSettingsPage from '@/pages/mypage/NotificationSettingsPage'
import NotificationsPage from '@/pages/NotificationsPage'
import RequireAuth from '@/components/auth/RequireAuth'
import ToastContainer from '@/components/ui/Toast'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/recruitments/:id" element={<RecruitmentDetailPage />} />
          <Route
            path="/notifications"
            element={
              <RequireAuth>
                <NotificationsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/mypage"
            element={
              <RequireAuth>
                <MyPage />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="account" replace />} />
            <Route path="account" element={<AccountSettingsPage />} />
            <Route path="recruitments" element={<MyRecruitmentsPage />} />
            <Route path="notifications" element={<NotificationSettingsPage />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
