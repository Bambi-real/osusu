import Navbar from './Navbar';
import Footer from './Footer';

export default function PageWrapper({
  children,
  hideNavbar = false,
  size = 'default'
}) {
  const maxWidth = {
    narrow:  'max-w-2xl',
    default: 'max-w-5xl',
    wide:    'max-w-7xl',
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!hideNavbar && <Navbar />}
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${maxWidth[size]}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
