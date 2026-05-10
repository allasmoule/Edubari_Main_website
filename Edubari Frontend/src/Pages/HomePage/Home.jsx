import HeroSlider from "./HomeComponents/HeroSlider";
import OurClients from "./HomeComponents/OurClients";
import WhyShouldChoose from "./HomeComponents/WhyShouldChoose";
import DomainSearch from "./HomeComponents/DomainSearch";
import Feature from "./HomeComponents/Feature";
import HowWorks from "./HomeComponents/HowWorks";
import Feedback from "./HomeComponents/Feedback";
import Pricing from "./HomeComponents/Pricing";
import GetInTouch from "./HomeComponents/GetInTouch";
import About from "./HomeComponents/About";
import WookProof from "./HomeComponents/WookProof";


const Home = () => {
    return (
        <div>
            <HeroSlider />
            <DomainSearch />
            <Pricing />
            <HowWorks />
            <Feature />
            <WookProof />
            {/* <OurClients /> */}
            <WhyShouldChoose />
            {/* <Feedback /> */}
            <About />
            <GetInTouch />
        </div>
    );
};

export default Home;