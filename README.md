# [Redux-Saga React playlist](https://www.youtube.com/playlist?list=PLdTPrJkdrLGFLkjyq_lXzTNuiWodTtPPB)

## [Redux-Saga React Полный Курс. Урок 2. Эффекты в деталях. Архитектура саг. React Router + Redux Saga.](https://www.youtube.com/watch?v=7Pq-2bBIzXY&list=PLdTPrJkdrLGFLkjyq_lXzTNuiWodTtPPB&index=2)

---

## [Redux-Saga API Reference](https://redux-saga.js.org/docs/api#api-reference)

---

`Redux-Saga` - работает поверх ES6 генераторов, поэтому умеет приостанавливать и возобнавлять работу в любой момент

[Тут всё коротко и понятно](https://redux-saga.js.org/docs/Glossary)

---

[Continue ...](https://youtu.be/7Pq-2bBIzXY?list=PLdTPrJkdrLGFLkjyq_lXzTNuiWodTtPPB&t=31)

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

Effects - это простой объект `JavaScript`, содержащий некоторые инструкции, которые будут выполнены в `Saga Middleware`.

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

Блокирующий вызов означает, что сага `yielded` эффект и будет ждать результата своего выполнения, прежде чем возобновить выполнение следующей инструкции внутри генератора, выдающего результат.

Неблокирующий вызов означает, что сага возобновится (продолжит выполнять код дальше, возможно паралельно запустит следующий еффект) сразу после получения Эффекта.

---

### [fork()](https://redux-saga.js.org/docs/api/#forkfn-args)

- Еффект, который указывает redux middleware выполнить неблокирующий вызов переданной функции
  (запросы выполняются паралельно)
- Все форкнутые (разветвлённые) задачи прикреплены к родителям

```js
export function* workerSaga() {
  // ...
  yield fork(loadPeople);
  yield fork(loadPlanets);
}
```

- Любая ошибка в форке всплывает к родительским задачам, если ошибка произошла то родительская задача блокируется и поле не будет вызвано. Тут не отработают не `loadPeople` не `loadPlanets`

```js
export function* loadPeople() {
  throw new Error();
  // Error
  //    at loadPeople
  // The above error occurred in task loadPeople
  // created by workerSaga
  /*
  Tasks cancelled due to error:
    workerSaga
    takeEvery(LOAD_DATA, workerSaga)
  */
}
```

### [spawn()](https://redux-saga.js.org/docs/api/#spawnfn-args)

- Создаёт паралельную задачу в корне саги, сам процесс привязан к родителю

- Не блокирующая задача

- Тут `loadPeople` не отработает, но отработает `loadPlanets`

```js
export function* workerSaga() {
  // ...
  yield spawn(loadPeople);
  yield spawn(loadPlanets);
}
```

---

## `spawn` и `fork` возвращают объект `task`

---

### [Task](https://redux-saga.js.org/docs/Glossary/#task)

Task - похож на процесс запущеный в фоне. В приложениях с redux-saga может быть много `tasks` (задач) запущеных паралельно.

---

### [join()](https://redux-saga.js.org/docs/api/#jointask)

- Заблокирует неблокирующую задачу и вернёт её результат (позволяет дождатся результата выполнения задачи )

```js
export function* loadPeople() {
  const people = yield call(swapiGet, 'people');
  yield put({ type: 'SET_PEOPLE', payload: people.results });
  return people;
}

export function* workerSaga() {
  const task = yield fork(loadPeople);
  const people = yield join(task); // join
}
```

---

### [select()](https://redux-saga.js.org/docs/api/#selectselector-args)

- Получить данные из store, useSelect/mapStateToProps (не блокирующий еффект)

- Лучшая практика - держать отдельно `store` от саг, писать код так чтоб сага была автономной и не зависила от `store` и получать значение от `actions`

```js
export function* workerSaga() {
  const store = yield select((s) => s);
}
```
