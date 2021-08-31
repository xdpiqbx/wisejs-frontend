import { all, call, spawn } from 'redux-saga/effects';

export function* authSaga() {
  console.log('Auth Saga');
}
export function* usersSaga() {
  console.log('Users Saga');
}
export function* paymentsSaga() {
  console.log('Payments Saga');
}

// eslint-disable-next-line require-yield
export default function* rootSaga() {
  const sagas = [authSaga, usersSaga, paymentsSaga];
  const retrySagas = sagas.map((saga) => {
    return spawn(function* () {
      while (true) {
        try {
          yield call(saga);
          break;
        } catch (error) {
          console.log(error);
          continue;
        }
      }
    });
  });
  yield all(retrySagas);
}

// Четвёртый подход через spawn
// export default function* rootSaga() {
//   yield spawn(authSaga);
//   yield spawn(usersSaga);
//   yield spawn(paymentsSaga);
// }

// Третий подход
// Напоминалка! - fork - связывает с родительской задачей
// Упадёт одна, не сработают остальные
// export default function* rootSaga() {
//   yield fork(authSaga);
//   yield fork(usersSaga);
//   yield fork(paymentsSaga);
//   // code
// }

// Второй подход (чтото тут не так, мож в all надо было завернуть)
// export default function* rootSaga() {
//   yield [fork(authSaga), fork(usersSaga), fork(paymentsSaga)];
//   // code
// }

// Первый подход
// export default function* rootSaga() {
//   yield [authSaga(), usersSaga(), paymentsSaga()];
//   // code
// }
