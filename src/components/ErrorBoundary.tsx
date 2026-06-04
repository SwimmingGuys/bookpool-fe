import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 실제 백엔드 연동 시 에러 리포팅 지점
    console.error('ErrorBoundary caught an error:', error, info)
  }

  handleReload = () => {
    window.location.assign('/')
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-stone-800">
          문제가 발생했어요
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          페이지를 불러오는 중 오류가 났어요. 잠시 후 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="mt-6 px-5 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
        >
          홈으로 돌아가기
        </button>
      </div>
    )
  }
}
