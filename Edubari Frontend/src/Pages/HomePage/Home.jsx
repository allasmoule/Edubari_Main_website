import React, { useEffect } from "react";
import { useLocation } from "react-router";
import HeroSlider from "./HomeComponents/HeroSlider";
import OurClients from "./HomeComponents/OurClients";
import WhyShouldChoose from "./HomeComponents/WhyShouldChoose";
import DomainSearch from "./HomeComponents/DomainSearch";
import Feature from "./HomeComponents/Feature";
import Pricing from "./HomeComponents/Pricing";
import Swal from "sweetalert2";

const Home = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.state?.scrollToDomain) {
            const section = document.getElementById("domain-search-section");
            if (section) {
                setTimeout(() => {
                    section.scrollIntoView({ behavior: "smooth" });
                    
                    // Show premium toast
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        background: '#ffffff',
                        color: '#1e293b',
                        iconColor: '#3b42f2',
                        width: '400px',
                        padding: '0.25rem 0.5rem',
                        customClass: {
                            popup: 'rounded-xl shadow-2xl border border-blue-50 px-1 py-1',
                            title: 'text-xs font-black tracking-tight ml-2',
                        },
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer)
                            toast.addEventListener('mouseleave', Swal.resumeTimer)
                        }
                    });

                    Toast.fire({
                        icon: 'info',
                        title: 'Select Your Domain First to Continue'
                    });

                    // Focus the input
                    const searchInput = document.getElementById("domain-search-input");
                    if (searchInput) {
                        searchInput.focus();
                    }
                }, 500);
            }
        }
    }, [location]);

    return (
        <div>
            <HeroSlider />
            <DomainSearch />
            <Pricing />
            <WhyShouldChoose />
            <Feature />
            <OurClients />
        </div>
    );
};

export default Home;
