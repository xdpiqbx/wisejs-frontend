import { takeEvery, call, put, fork, spawn } from '@redux-saga/core/effects';

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

export function* loadPeople() {
  throw new Error();
  // The above error occurred in task loadPeople
  // created by workerSaga
  const people = yield call(swapiGet, 'people');
  yield put({ type: 'SET_PEOPLE', payload: people.results });
  console.log('load people');
}

export function* loadPlanets() {
  const planets = yield call(swapiGet, 'planets');
  yield put({ type: 'SET_PLANETS', payload: planets.results });
  console.log('load planets');
}

export function* workerSaga() {
  // const data = yield call(getPeople);
  // yield put({ type: 'SET_PEOPLE', payload: data.results }); // задиспатчил action

  // const people = yield call(swapiGet, 'people');
  // console.log('people', people);

  // const planets = yield call(swapiGet, 'planets');
  // console.log('planets', planets);

  // yield put({ type: 'SET_PEOPLE', payload: people.results }); // задиспатчил action
  // yield put({ type: 'SET_PLANETS', payload: planets.results }); // задиспатчил action

  yield spawn(loadPeople);
  yield spawn(loadPlanets);
}

export function* watchLoadDataSaga() {
  yield takeEvery('LOAD_DATA', workerSaga);
}

export default function* rootSaga() {
  yield fork(watchLoadDataSaga);
}
