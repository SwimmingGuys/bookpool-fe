import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import BoardPage from '@/pages/BoardPage'
import CalendarPage from '@/pages/CalendarPage'
import RecruitmentDetailPage from '@/pages/RecruitmentDetailPage'
import PublisherPage from '@/pages/PublisherPage'
import NoticePage from '@/pages/NoticePage'
import NoticeDetailPage from '@/pages/NoticeDetailPage'
import SupportPage from '@/pages/SupportPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import MyPage from '@/pages/mypage/MyPage'
import AccountSettingsPage from '@/pages/mypage/AccountSettingsPage'
import MyRecruitmentsPage from '@/pages/mypage/MyRecruitmentsPage'
import NotificationSettingsPage from '@/pages/mypage/NotificationSettingsPage'
import NotificationsPage from '@/pages/NotificationsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminRecruitmentsPage from '@/pages/admin/AdminRecruitmentsPage'
import AdminRecruitmentFormPage from '@/pages/admin/AdminRecruitmentFormPage'
import AdminNoticesPage from '@/pages/admin/AdminNoticesPage'
import AdminInquiriesPage from '@/pages/admin/AdminInquiriesPage'
import AdminLayout from '@/components/admin/AdminLayout'
import RequireAdmin from '@/components/admin/RequireAdmin'
import RequireAuth from '@/components/auth/RequireAuth'
import ToastContainer from '@/components/ui/Toast'
import ErrorBoundary from '@/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="recruitments" replace />} />
          <Route path="recruitments" element={<AdminRecruitmentsPage />} />
          <Route path="recruitments/new" element={<AdminRecruitmentFormPage />} />
          <Route path="recruitments/:id" element={<AdminRecruitmentFormPage />} />
          <Route path="notices" element={<AdminNoticesPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
        </Route>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/recruitments/:id" element={<RecruitmentDetailPage />} />
          <Route path="/publishers/:name" element={<PublisherPage />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/notice/:id" element={<NoticeDetailPage />} />
          <Route
            path="/support"
            element={
              <RequireAuth>
                <SupportPage />
              </RequireAuth>
            }
          />
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
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
