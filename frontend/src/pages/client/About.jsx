
export default function About() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                        Rreth Nesh
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                        Platforma juaj e besuar për të gjetur profesionistë të kualifikuar për çdo nevojë.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
                    <div className="p-8 md:p-12">
                        <div className="prose prose-lg text-gray-500 mx-auto">
                            <p className="mb-6">
                                <span className="font-bold text-gray-900">Fiks</span> është krijuar me një qëllim të thjeshtë: të lehtësojmë jetën tuaj duke ju lidhur me profesionistët më të mirë në treg. Ne e kuptojmë se gjetja e një eksperti të besueshëm për riparime ose projekte shtëpiake mund të jetë sfiduese.
                            </p>
                            <p>
                                Misioni ynë është të ofrojmë një urë lidhëse të sigurt dhe efikase mes klientëve që kanë nevojë për shërbime dhe profesionistëve të dedikuar që ofrojnë zgjidhje cilësore.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <ServiceCard
                        title="Elektricist"
                        description="Instalime, riparime dhe mirëmbajtje të sistemeve elektrike për shtëpinë apo biznesin tuaj."
                        icon="⚡"
                    />
                    <ServiceCard
                        title="Programues"
                        description="Zgjidhje digjitale, krijim faqesh web dhe aplikacione të personalizuara."
                        icon="💻"
                    />
                    <ServiceCard
                        title="Moler"
                        description="Lyerje profesionale, dekorime dhe rifinitura për ambiente të brendshme dhe të jashtme."
                        icon="🎨"
                    />
                    <ServiceCard
                        title="Hidraulik"
                        description="Zgjidhje për çdo problem hidraulik, nga instalimet e reja deri tek riparimet urgjente."
                        icon="🔧"
                    />
                </div>
            </div>
        </div>
    )
}

function ServiceCard({ title, description, icon }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500">{description}</p>
        </div>
    )
}
