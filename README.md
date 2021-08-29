# [Redux-Saga React playlist](https://www.youtube.com/playlist?list=PLdTPrJkdrLGFLkjyq_lXzTNuiWodTtPPB)

## [Redux-Saga API Reference](https://redux-saga.js.org/docs/api#api-reference)

---

[Continue ...](https://youtu.be/ah5voE_SGjo?list=PLdTPrJkdrLGFLkjyq_lXzTNuiWodTtPPB&t=2075)

---

```code
git clone https://github.com/xdpiqbx/wisejs-frontend.git -b redux-saga-playlist .
```

```code
npx create-react-app .
npm i redux react-redux redux-saga
```

---

- [createSagaMiddleware()](https://redux-saga.js.org/docs/api#createsagamiddlewareoptions)

- [sagaMiddleware.run(rootSaga)](https://redux-saga.js.org/docs/api#middlewarerunsaga-args)

---

Создать `createSagaMiddleware`, `createStore`, `applyMiddleware(sagaMiddleware)` в store и `sagaMiddleware.run()`

```js
// redux/store.js
import createSagaMiddleware from '@redux-saga/core';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers/rootReducer';
import rootSaga from './sagas/rootSaga';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(applyMiddleware(sagaMiddleware))
);
// window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ - это чтоб расширение в хроме работало

sagaMiddleware.run(rootSaga);

export default store;
```

---

Обернуть приложение в `Provider` и передать пропсом `store`

```js
// ...
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

---

Saga Worker - выполняет бизнесс логику (запрос/таймаут/запись в кеш и т.д.);

Saga Watcher - следит за `dispatch` `action` в приложении и запускает `worker`;

Effects - Вызываются в `Watcher`. Функции создающие объекты, у которых описаны инструкции выполнения действий.

---

```js
export function* workerSaga() {
  // ... Business logic
}

export function* watchSomeEventSaga() {
  yield SomeEffect('CLICK');
  yield workerSaga();
  // ... или (в зависимости от Effect)
  yield SomeEffect('CLICK', workerSaga);
}

export default function* rootSaga() {
  yield watchSomeEventSaga();
}
```

---

## Effects

---

### [take()](https://redux-saga.js.org/docs/api#takepattern)

- Выполняется один раз

```js
export function* watchClickSaga() {
  while (true) {
    // [2] при `while (true)` будет отрабатывать на каждый клик
    yield take('CLICK'); // [1] выполнится 1 раз, пока не отработет CLICK дальше код не выполнится
    yield workerSaga();
  }
}
```

---

### [takeEvery()](https://redux-saga.js.org/docs/api#takeeverypattern-saga-args)

- Выполняется каждый раз (не надо оборачивать в `while (true) { ... }`)

```js
export function* watchClickSaga() {
  yield takeEvery('CLICK', workerSaga);
}
```

---

### [takeLatest()](https://redux-saga.js.org/docs/api#takelatestpattern-saga-args)

- Автоматически отменяет любую предидущую задачу саги, запущеную ранее, если она ещё не выполнилась

(например если прикаждом клике будет асинхронная операция)

```js
const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

export function* workerSaga() {
  yield wait(1000); // промис на секнду
  console.log('click from saga');
}

export function* watchClickSaga() {
  // изза задержки в серунду, пока быстро кликаю ничего не произойдёт.
  yield takeLatest('CLICK', workerSaga); // отработает через секунду после последнего клика
}

export default function* rootSaga() {
  yield watchClickSaga();
}
```

---

### [takeLeading()](https://redux-saga.js.org/docs/api#takeleadingpattern-saga-args)

- Автоматически отменяет любую следующую задачу саги, запущеную позднее, если первая запущенная ещё выполнилась

(например если прикаждом клике будет асинхронная операция)

```js
export function* watchClickSaga() {
  // работает противоположно takeLatest
  yield takeLeading('CLICK', workerSaga); // отработает через секунду после первого клика
}
```

---

### Пример асинхронного запроса на сервер

```js
import { takeEvery } from '@redux-saga/core/effects';

const getPeople = async () => {
  const BASE_URL = 'https://swapi.dev/api';
  const request = await fetch(`${BASE_URL}/people/1/`);
  const data = await request.json();
  return data;
};

export function* workerSaga() {
  const data = yield getPeople();
  console.log(data); // тут получил json от сервера
}

export function* watchClickSaga() {
  yield takeEvery('CLICK', workerSaga);
}

export default function* rootSaga() {
  yield watchClickSaga();
}
```

Теперь нужно положить данные в `state` с помощю еффекта `put`

```js
// Готовлю State и Action
const initialState = {
  peoples: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_PEOPLE':
      return { ...state, peoples: [...state.peoples, ...action.payload] };
    default:
      return state;
  }
}
```

---

### [put()](https://redux-saga.js.org/docs/api/#putaction)

- `dispatch`-ит actions

```js
import { /* ... */, put } from '@redux-saga/core/effects';
const getPeople = async () =>  { /* ... */ }

export function* workerSaga() {
  const data = yield getPeople();
  yield put({ type: 'SET_PEOPLE', payload: data.results }); // задиспатчил action
}

export function* watchClickSaga() { /* ... */ }
export default function* rootSaga() { /* ... */ }
```

---

### [call()](https://redux-saga.js.org/docs/api/#callfn-args)

- Выполняет переданную `fn`. Если `fn` вернёт `promise`, приостанавливает сагу до тех пор, пока `promise` не вызовет `resolve`. `fn` - простая, асинхронная или генератор. Следущие параметры - аргументы

```js
import { /* ... */, put } from '@redux-saga/core/effects';
const getPeople = async () =>  { /* ... */ }

export function* workerSaga() {
  const data = yield call(getPeople); // Тут `fn` - асинхронная
  yield put({ type: 'SET_PEOPLE', payload: data.results });
}

export function* watchClickSaga() { /* ... */ }
export default function* rootSaga() { /* ... */ }
```

---

### Блокирующие еффекты и не блокирующие еффекты

`take` & `call` - блокирующие еффекты
`takeEvery` сам по себе не блокирующий, но внутри использует `take` + `fork`

---

### [fork()](https://redux-saga.js.org/docs/api/#forkfn-args)

- Еффект, который указывает redux middleware выполнить неблокирующий вызов переданной функции
  (запросы выполняются паралельно)
- Все форкнутые (разветвлённые) задачи прикреплены к родителям
- Любая ошибка в форке всплывает к родительским задачам, если ошибка произошла то родительская задача блоенкируется и поле не будет вызвано

```js
export function* workerSaga() {
  // ...
  yield fork(loadPeople);
  yield fork(loadPlanets);
}
```
