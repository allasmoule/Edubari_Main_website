import HeroSlider from "./HomeComponents/HeroSlider";
import OurClients from "./HomeComponents/OurClients";
import WhyShouldChoose from "./HomeComponents/WhyShouldChoose";
import DomainSearch from "./HomeComponents/DomainSearch";
import Feature from "./HomeComponents/Feature";
import Pricing from "./HomeComponents/Pricing";



const Home = () => {
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