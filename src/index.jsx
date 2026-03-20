import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

document.body.addEventListener('click', function (_evt) {
    // console.dir(this);
    //note evt.target can be a nested element, not the body element, resulting in misfires
    // console.log(evt.target);
    //   if (evt.target.nodeName !== 'CANVAS') {
    //     alert('body clicked')
    //   }
});

const nav = document.getElementsByTagName("nav")[0];

nav.addEventListener('click', function (_evt) {
    if (nav.style.display) {
      nav.style.display = 'unset'
      console.log('hi')
    } else {
      nav.style.display = '';
    }
});