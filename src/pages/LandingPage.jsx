import { Link } from 'react-router-dom';
import { FaLeaf, FaTshirt, FaCloudSun, FaMagic } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="flex flex-col bg-white lg:flex-row lg:h-[calc(100vh-73px)] lg:overflow-hidden">
      <div 
        className="w-full lg:w-1/2 px-6 py-16 sm:px-8 sm:py-20 lg:p-10 xl:p-14 flex flex-col justify-center relative overflow-hidden text-center lg:text-left"
      >
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-slate-50 rounded-full opacity-70 z-0" aria-hidden="true"></div>
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-slate-800 mb-5 mt-2 sm:mb-6">
            Effortless style, <br/>
            <span className="text-indigo-600 font-normal">every day</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 mb-8 max-w-lg leading-relaxed mx-auto lg:mx-0">
            Simplify your wardrobe management and discover perfect outfit combinations tailored to your style and the weather.
          </p>
          <Link 
            to="/Signup" 
            className="inline-block w-fit px-8 py-3 lg:px-10 lg:py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-base lg:text-lg rounded-md hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-slate-50 to-slate-100 p-6 sm:p-8 lg:p-10 flex items-center justify-center mt-12 lg:mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 w-full max-w-xl">
          {[
            { 
              icon: <FaTshirt size={26} />, 
              title: "Wardrobe Management", 
              desc: "Catalog and organize your clothing" 
            },
            { 
              icon: <FaLeaf size={26} />, 
              title: "Seasonal Planning", 
              desc: "Create outfits for any season" 
            },
            { 
              icon: <FaCloudSun size={26} />, 
              title: "Weather Integration", 
              desc: "Recommendations based on forecast" 
            },
            { 
              icon: <FaMagic size={26} />, 
              title: "Style Guidance", 
              desc: "Personalized outfit suggestions" 
            },
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-5 lg:p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group h-full"
            >
              <div className="text-indigo-600 mb-3 lg:mb-4 p-2 bg-slate-50 inline-block rounded-md group-hover:bg-indigo-50 transition-colors duration-300">
                {feature.icon}
              </div>
              <h2 className="font-medium text-base sm:text-lg text-slate-800 mb-2">
                {feature.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;