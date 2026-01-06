import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-indigo-700 text-white overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-indigo-900 opacity-50"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="md:w-2/3">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                            Zgjidhja për çdo problem <br className="hidden md:block" />
                            <span className="text-indigo-200">në shtëpinë tuaj</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-2xl">
                            Lidheni me profesionistë të kualifikuar në sekonda. Nga riparimet e vogla deri te projektet e mëdha, Fiks është këtu për ju.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/sherbimet" className="inline-block bg-white text-indigo-700 font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-100 transition duration-300 text-center shadow-lg">
                                Gjej Profesionistin
                            </Link>
                            <Link to="/rreth-nesh" className="inline-block bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-white/10 transition duration-300 text-center">
                                Mëso më shumë
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Si funksionon Fiks?
                        </h2>
                        <p className="mt-4 text-xl text-gray-500">
                            Tre hapa të thjeshtë për të zgjidhur problemin tuaj.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <StepCard
                            number="1"
                            title="Kërko Shërbimin"
                            description="Shfletoni kategoritë tona dhe gjeni profesionistin që ju përshtatet nevojave tuaja."
                            icon="🔍"
                        />
                        <StepCard
                            number="2"
                            title="Zgjidh Ekspertin"
                            description="Krahasoni profilet dhe zgjidhni më të mirin bazuar në vlerësimet e klientëve."
                            icon="✅"
                        />
                        <StepCard
                            number="3"
                            title="Zgjidhe Problemin"
                            description="Profesionisti vjen tek ju dhe realizon punën me standardet më të larta."
                            icon="🛠️"
                        />
                    </div>
                </div>
            </section>

            {/* Featured Services Preview */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900">Shërbimet Popullore</h2>
                            <p className="mt-2 text-lg text-gray-500">Profesionistët më të kërkuar të javës.</p>
                        </div>
                        <Link to="/sherbimet" className="hidden md:block text-indigo-600 font-bold hover:text-indigo-800 transition">
                            Shiko të gjitha &rarr;
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ServicePreviewCard title="Elektricist" icon="⚡" color="bg-yellow-100 text-yellow-600" />
                        <ServicePreviewCard title="Hidraulik" icon="🔧" color="bg-blue-100 text-blue-600" />
                        <ServicePreviewCard title="Bojaxhi" icon="🎨" color="bg-green-100 text-green-600" />
                        <ServicePreviewCard title="Pastrim" icon="✨" color="bg-purple-100 text-purple-600" />
                    </div>

                    <div className="mt-10 text-center md:hidden">
                        <Link to="/sherbimet" className="text-indigo-600 font-bold hover:text-indigo-800 transition">
                            Shiko të gjitha &rarr;
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-indigo-700 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-extrabold text-white mb-8">
                        Jeni gati për të filluar?
                    </h2>
                    <Link to="/signup" className="inline-block bg-white text-indigo-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1">
                        Krijoni Llogari Falas
                    </Link>
                </div>
            </section>
        </div>
    )
}

function StepCard({ number, title, description, icon }) {
    return (
        <div className="relative p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold border-4 border-gray-50">
                {number}
            </div>
            <div className="mt-6 text-5xl mb-6">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{description}</p>
        </div>
    )
}

function ServicePreviewCard({ title, icon, color }) {
    return (
        <div className="group cursor-pointer rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
            <div className={`w-14 h-14 rounded-lg ${color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
        </div>
    )
}
