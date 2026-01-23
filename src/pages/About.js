export default function About(){
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero Section with Heart Icon */}
      <div className="text-center mb-12 relative">
        <img 
          src="/haltfav.png" 
          alt="HALT Heart" 
          className="w-32 h-32 mx-auto mb-6 animate-pulse"
        />
        <h1 className="text-4xl font-bold mb-6 text-gray-900">About HALTSHELTER</h1>
        <p className="text-xl text-gray-600 italic">Help Animals Live & Thrive</p>
      </div>
      
      <p className="text-lg text-gray-700 mb-6 leading-relaxed">
        We are a mission-driven animal rescue dedicated to <span className="font-semibold text-red-600">transforming lives through compassion</span>. 
        From frontline intervention to medical rehabilitation, from temporary shelter to forever homes - we walk alongside every animal on their journey from survival to thriving.
      </p>
      
      <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-6 rounded-r-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Promise</h2>
        <p className="text-gray-700 leading-relaxed">
          Every animal that comes through our doors receives not just medical care, but <span className="font-semibold">genuine love, patient rehabilitation, and unwavering hope</span> for their future. 
          We believe that with the right support, every animal can discover what it means to truly live and thrive.
        </p>
      </div>
      
      <p className="text-gray-700 mb-4">Transparency and impact reporting guide every decision. Your trust fuels our mission, and we're committed to showing you exactly how your compassion changes lives.</p>
    </main>
  );
}
