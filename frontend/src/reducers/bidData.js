const bidReducers = (state = { authData: null }, action) => {
    switch (action.type) {
      
      case "bidData":
        console.log(action);
        // localStorage.setItem('user', JSON.stringify({...action?.data}));
        return state;
  
      default:
        return {...state , authData: action?.data};
    }
  };
  export default bidReducers;
  