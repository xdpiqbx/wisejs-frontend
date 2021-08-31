const initialState = {};

export default function reducer(state = initialState, action) {
  return state;
}

// const initialState = {
//   peoples: [],
//   planets: [],
// };

// export default function reducer(state = initialState, action) {
//   switch (action.type) {
//     case 'SET_PEOPLE':
//       return { ...state, peoples: [...state.peoples, ...action.payload] };
//     case 'SET_PLANETS':
//       return { ...state, planets: [...state.planets, ...action.payload] };
//     default:
//       return state;
//   }
// }
