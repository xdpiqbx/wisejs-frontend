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
