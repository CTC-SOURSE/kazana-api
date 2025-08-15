import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import IndexPage from './pages/Index';
import BookSend from './pages/BookSend';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/book-send" element={<BookSend />} />
        <Route path="/admin" element={<div className="p-6">Admin</div>} />
      </Routes>
    </>
  );
}
