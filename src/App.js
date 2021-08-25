import { useDispatch, useSelector } from 'react-redux';

function App() {
  const store = useSelector((store) => store);
  const dispatch = useDispatch();
  console.log(store);
  return (
    <div>
      It works!{' '}
      <button onClick={() => dispatch({ type: 'CLICK' })}>Click me</button>
    </div>
  );
}

export default App;
