import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

const mobileHeader = document.getElementsByClassName('menu')[0];
const nav = document.getElementsByTagName("nav")[0];

mobileHeader.addEventListener('click', function (evt) {
    if (evt.target === this || evt.target.tagName !== 'A') {
        nav.style.display = nav.style.display === 'none' ? 'flex' : 'none';
    }
});