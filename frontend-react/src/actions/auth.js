import * as api from "../api/auth";
export const signIn = (formData, history) => async (dispatch) => {
    try {
        const { data } = await api.signin(formData); 
        dispatch({type: 'Auth', data: data});
        history.push('/wingo');
    } catch (error) {
        console.log(error.response.data.error);
    }

}
export const signUp = (formData, history) => async (dispatch) => {
    try {
        const { data } = await api.signup(formData); 
        dispatch({type: 'Auth', data: data});
        history.push('/wingo');

    } catch (error) {
        
    }

}
export const bidData = (bidData) => async (dispatch) => {
    try {
        const { data } = await api.bidData(bidData); 
        dispatch({type: 'bidData', data: data});

    } catch (error) {
        
    }

}
export const applyBonus = (formData, history) => async (dispatch) => {
    try {
        const { data } = await api.applyBonus(formData); 
        dispatch({type: 'applyBonus', data: data});
        history.push('/mypromotion');

    } catch (error) {
        
    }

}
export const addBank = (formData) => async (dispatch) => {
    try {
        const { data } = await api.addBank(formData); 
        dispatch({type: 'bank', data: data});
    

    } catch (error) {
        
    }

}