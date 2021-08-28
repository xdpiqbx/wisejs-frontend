import { takeEvery, call, put } from '@redux-saga/core/effects';

const getPeople = async () => {
  const BASE_URL = 'https://swapi.dev/api';
  const request = await fetch(`${BASE_URL}/people/`);
  const data = await request.json();
  return data;
};

export function* workerSaga() {
  const data = yield call(getPeople);
  yield put({ type: 'SET_PEOPLE', payload: data.results }); // задиспатчил action
}

export function* watchClickSaga() {
  yield takeEvery('LOAD_DATA', workerSaga);
}

export default function* rootSaga() {
  yield watchClickSaga();
}
