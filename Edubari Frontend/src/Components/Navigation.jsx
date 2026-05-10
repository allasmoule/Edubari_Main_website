import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { FiMenu, FiX } from 'react-icons/fi';

const Navigation = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const navItems = [
        { path: "/", label: "Home" },
        { path: "/blog", label: "Blog" },
        { path: "/contact", label: "Contact" },
        { path: "/work-proof", label: "Work Proof" },
        { path: "/payment-purchase", label: "Payment & Purchase" },
    ];

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="w-full bg-primary/95 backdrop-blur-sm py-4 px-4 sm:px-6 md:px-12 flex items-center justify-between border-b border-white/20">
            {/* Logo Section */}
            <NavLink to="/" className="z-50 shrink-0 flex items-center cursor-pointer group select-none relative">
                <h1 className="text-[24px] sm:text-[28px] font-black tracking-tighter sm:group-hover:tracking-tight flex items-center transition-all duration-300">
                    <span className="text-dark sm:group-hover:text-tertiary transition-colors duration-300">Edu</span>
                    <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6] sm:group-hover:from-secondary sm:group-hover:to-secondary-light transition-all duration-500 drop-shadow-sm sm:group-hover:drop-shadow-md">
                        Bari
                    </span>
                </h1>
            </NavLink>

            {/* Desktop Navigation Links - Pill Shape */}
            <div className="hidden lg:flex items-center px-8 py-2.5 rounded-full border border-tertiary gap-8 bg-white/40">
                {navItems.map((item) => {
                    return (
                        <NavLink 
                            key={item.path} 
                            to={item.path} 
                            className={({ isActive }) =>
                                `relative text-[15px] transition-all duration-300 ${
                                    isActive
                                        ? "text-secondary font-semibold"
                                        : "text-dark hover:text-secondary font-medium"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    );
                })}
            </div>

            {/* Actions (Desktop) & Hamburger Menu (Mobile) */}
            <div className="flex items-center gap-4 shrink-0 relative z-60">
                {/* Desktop Software Demo */}
                <div className="hidden lg:flex items-center gap-3">
                    <NavLink to="/software-demo" className="relative font-bold shadow-md hover:shadow-lg group overflow-hidden rounded-full p-[2px] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
                        <span className="absolute inset-0 bg-linear-to-r from-tertiary via-[#A78BFA] to-secondary rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-[spin_4s_linear_infinite]" />
                        <span className="relative z-10 flex items-center justify-center gap-2 bg-white rounded-full px-6 py-2 text-[15px] text-tertiary-dark transition-colors duration-300 group-hover:bg-primary-light">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                            </span>
                            Software Demo
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </NavLink>
                </div>

                {/* Mobile Hamburger Icon */}
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 text-dark hover:text-tertiary focus:outline-none transition-colors duration-300 rounded-full hover:bg-white/50"
                    aria-label="Toggle navigation menu"
                >
                    {isMobileMenuOpen ? (
                        <FiX className="text-2xl" />
                    ) : (
                        <FiMenu className="text-2xl" />
                    )}
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
            <div 
                className={`fixed inset-0 bg-dark/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={closeMobileMenu}
            />
            
            <div className={`fixed top-0 right-0 h-screen w-[85%] sm:w-[350px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] lg:hidden flex flex-col pt-24 pb-6 px-6 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Mobile Links */}
                <div className="flex flex-col gap-2 grow overflow-y-auto">
                    {navItems.map((item, index) => {
                        return (
                            <NavLink 
                                key={item.path} 
                                to={item.path} 
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    `p-4 rounded-xl text-[16px] transition-all duration-300 flex items-center ${
                                        isActive
                                            ? "bg-primary text-secondary font-bold"
                                            : "text-dark/80 hover:bg-gray-50 hover:text-tertiary font-medium"
                                    }`
                                }
                                style={{
                                    opacity: isMobileMenuOpen ? 1 : 0,
                                    transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(20px)',
                                    transitionDelay: `${isMobileMenuOpen ? index * 50 : 0}ms`
                                }}
                            >
                                {item.label}
                            </NavLink>
                        );
                    })}
                </div>

                {/* Mobile Software Demo Action */}
                <div 
                    className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-3"
                    style={{
                        opacity: isMobileMenuOpen ? 1 : 0,
                        transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                        transitionDelay: `${isMobileMenuOpen ? navItems.length * 50 + 100 : 0}ms`
                    }}
                >
                    <NavLink 
                        to="/software-demo" 
                        onClick={closeMobileMenu}
                        className="w-full py-3.5 px-4 text-center text-tertiary font-bold bg-linear-to-r from-tertiary/10 to-[#8B5CF6]/10 hover:from-tertiary/15 hover:to-[#8B5CF6]/15 border border-tertiary/20 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary"></span>
                        </span>
                        Software Demo
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;