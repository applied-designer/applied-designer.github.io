import ReactDOM from 'react-dom/client'
import './styles.css'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)

document.body.addEventListener('click', function (_evt) {
    // console.dir(this);
    //note evt.target can be a nested element, not the body element, resulting in misfires
    // console.log(evt.target);
    //   if (evt.target.nodeName !== 'CANVAS') {
    //     alert('body clicked')
    //   }
})