export default function About(){
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
          <div className="text-center">
            <img 
              src="/haltfav.png" 
              alt="HALT Heart" 
              className="w-40 h-40 mx-auto mb-8 animate-pulse"
            />
            <h1 className="text-6xl md:text-7xl font-black mb-6 text-white tracking-tight">About <span className="text-amber-300">HALTSHELTER</span></h1>
            <p className="text-2xl font-black text-amber-200 mb-2">Help Animals Live & Thrive</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Main Text */}
          <div>
            <p className="text-lg font-medium text-gray-700 mb-8 leading-relaxed">
              We are a mission-driven animal rescue dedicated to <span className="font-black text-red-700">transforming lives through compassion</span>. 
              From frontline intervention to medical rehabilitation, from temporary shelter to forever homes - we walk alongside every animal on their journey from survival to thriving.
            </p>
            
            <p className="text-lg font-medium text-gray-700 leading-relaxed">
              Transparency and impact reporting guide every decision. Your trust fuels our mission, and we're committed to showing you exactly how your compassion changes lives.
            </p>
          </div>

          {/* Our Promise Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200 h-fit">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💝</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Our Promise</h2>
            </div>
            <p className="text-gray-700 leading-relaxed font-medium">
              Every animal that comes through our doors receives not just medical care, but <span className="font-black text-red-700">genuine love, patient rehabilitation, and unwavering hope</span> for their future. 
              We believe that with the right support, every animal can discover what it means to truly live and thrive.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
