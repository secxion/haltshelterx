export default function Dashboard(){
  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <div className="flex justify-center mb-6">
        <img src="/haltfav.png" alt="" className="w-20 h-20 animate-pulse" />
      </div>
      <h1 className="text-3xl font-bold mb-3 text-center">💼 Your Impact Dashboard</h1>
      <p className="text-gray-700 mb-8 text-center text-lg max-w-2xl mx-auto">Track your contributions, view animals you've helped, and stay connected with the lives you're transforming.</p>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { name: "Your Stories", desc: "Animals you've sponsored or adopted" },
          { name: "Donation History", desc: "View your giving impact over time" },
          { name: "Newsletter Archive", desc: "Catch up on rescue updates" }
        ].map(w => (
          <div key={w.name} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-lg transition-shadow">
            <h3 className="font-semibold mb-2 text-red-700">{w.name}</h3>
            <p className="text-sm text-gray-600">{w.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
