import Header from './Header'
import Footer from './Footer'
import CreateCampaignFAB from './CreateCampaignFAB'
import BetaBanner from './BetaBanner'
import BetaFeedbackWidget from './BetaFeedbackWidget'

export default function MainLayout({ children, noFooter }: { children: React.ReactNode; noFooter?: boolean }) {
  return (
    <div className={`flex flex-col ${noFooter ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <BetaBanner />
      <Header />
      <main className={noFooter ? 'flex-1 overflow-hidden' : 'flex-grow'}>
        {children}
      </main>
      {!noFooter && <Footer />}
      <CreateCampaignFAB />
      <BetaFeedbackWidget />
    </div>
  )
}
