import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}
