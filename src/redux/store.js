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
