import Header from './Header'
import Footer from './Footer'
import CreateCampaignFAB from './CreateCampaignFAB'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <CreateCampaignFAB />
    </div>
  )
}
