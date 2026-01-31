const authReducers = (state = { authData: null }, action) => {
  switch (action.type) {
    
    case "Auth":
      
      localStorage.setItem('user', JSON.stringify({...action?.data}));
      return state;

    default:
      return {...state , authData: action?.data};
  }
};
export default authReducers;
