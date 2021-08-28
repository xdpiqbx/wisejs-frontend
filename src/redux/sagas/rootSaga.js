import { takeEvery, call, put } from '@redux-saga/core/effects';

// const getPeople = async () => {
//   const BASE_URL = 'https://swapi.dev/api';
//   const request = await fetch(`${BASE_URL}/people/`);
//   const data = await request.json();
//   return data;
// };

const swapiGet = async (pattern) => {
  const BASE_URL = 'https://swapi.dev/api';
  const request = await fetch(`${BASE_URL}/${pattern}/`);
  const data = await request.json();
  return data;
};

export function* workerSaga() {
  // const data = yield call(getPeople);
  // yield put({ type: 'SET_PEOPLE', payload: data.results }); // задиспатчил action

  const people = yield call(swapiGet, 'people');
  console.log('people', people);

  const planets = yield call(swapiGet, 'planets');
  console.log('planets', planets);

  yield put({ type: 'SET_PEOPLE', payload: people.results }); // задиспатчил action
  yield put({ type: 'SET_PLANETS', payload: planets.results }); // задиспатчил action
}

export function* watchClickSaga() {
  yield takeEvery('LOAD_DATA', workerSaga);
}

export default function* rootSaga() {
  yield watchClickSaga();
}
