import './App.css';
import Footer from './components/Footer';
import Header from './components/Header';
import HomePage from './components/HomePage';

function App() {
    return (
        <div>
            <header>
                <Header />
            </header>

            <main className="w-[80%] mx-auto pt-2">
                <HomePage />
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default App;
