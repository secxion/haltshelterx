export default function Merch(){
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex justify-center mb-4">
        <img src="/haltfav.png" alt="" className="w-16 h-16 animate-pulse" />
      </div>
      <h1 className="text-3xl font-bold mb-3 text-center">🎨 Wear Your Compassion</h1>
      <p className="text-gray-700 mb-8 text-center text-lg">Mission-driven designs coming very soon! Every purchase funds life-saving rescue operations—style that saves lives.</p>
      <div className="grid gap-6 md:grid-cols-3">
        {[1,2,3].map(i => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400 text-xs">Mockup</div>
            <h3 className="font-semibold">Design Concept {i}</h3>
          </div>
        ))}
      </div>
    </main>
  );
}
