import { useDispatch, useSelector } from 'react-redux';

function App() {
  const store = useSelector((store) => store);
  const dispatch = useDispatch();
  console.log(store);
  return <div>It works!</div>;
}

export default App;
