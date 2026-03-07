const applyBonusRed = (state = { authData: null }, action) => {
    switch (action.type) {
      
      case "applyBonus":
        console.log(action);
        // localStorage.setItem('user', JSON.stringify({...action?.data}));
        return state;
  
      default:
        return {...state , authData: action?.data};
    }
  };
  export default applyBonusRed;
  