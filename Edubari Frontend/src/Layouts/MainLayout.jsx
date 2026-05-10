import React from 'react'
import { NavLink, Outlet } from 'react-router'
import Navigation from '../Components/Navigation'
import Footer from '../Components/Footer'
import ScrollToTop from '../Components/ScrollToTop'

const MainLayout = () => {
  return (
    <div>
        <ScrollToTop />
        <header className="sticky top-0 z-50">
                <Navigation></Navigation>
        </header>
        <main>
            <Outlet></Outlet>
        </main>
        <Footer />
    </div>
  )
}

export default MainLayout