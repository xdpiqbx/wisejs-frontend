import { takeLeading } from '@redux-saga/core/effects';

const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

export function* workerSaga() {
  yield wait(1000);
  console.log('click from saga');
}

export function* watchClickSaga() {
  yield takeLeading('CLICK', workerSaga);
}

export default function* rootSaga() {
  yield watchClickSaga();
}
