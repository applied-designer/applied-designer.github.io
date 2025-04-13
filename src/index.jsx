import ReactDOM from 'react-dom'
import './styles.css'
import App from './App'

ReactDOM.render(<App />, document.getElementById('root'))

document.body.addEventListener('click', function (evt) {
  // console.dir(this);
  //note evt.target can be a nested element, not the body element, resulting in misfires
  // console.log(evt.target);
  //   if (evt.target.nodeName !== 'CANVAS') {
  //     alert('body clicked')
  //   }
})
