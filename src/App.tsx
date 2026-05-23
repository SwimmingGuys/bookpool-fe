import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import BoardPage from '@/pages/BoardPage'
import RecruitmentDetailPage from '@/pages/RecruitmentDetailPage'
import ToastContainer from '@/components/ui/Toast'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/recruitments/:id" element={<RecruitmentDetailPage />} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
