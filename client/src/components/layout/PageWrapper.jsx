import Navbar from './Navbar';
import Footer from './Footer';

export default function PageWrapper({ children, hideNavbar = false }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {!hideNavbar && <Navbar />}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-full items-start">
        {children}
      </main>
      <Footer />
    </div>
  );
}