import axios from 'axios';

const production = "https://vgaserver3-147401630703.asia-south1.run.app";
const testing = "http://localhost:4001";

const cricketTesting = "http://localhost:4001";
const cricketProduction = "https://api.truewin.club";

export const url = testing;
;
export const cricket = cricketTesting;

 const API = axios.create({baseURL: url});

 export const signin = (formData) => API.post('/user/signin/', formData);
 export const signup = (formData) => API.post('/user/signup/', formData);
 export const applyBonus = (formData) => API.post('/applyBonus/', formData);
 export const applyWithdrawal = (formData) => API.post('/applyWithdrawal/', formData);
 export const applyWithdrawalUSDT = (formData) => API.post('/applyWithdrawalUSDT/', formData);
 export const minute1_bidData = (bidData) => API.post('/minute1_bidData/', bidData);
 export const minute3_bidData = (bidData) => API.post('/minute3_bidData/', bidData);
 export const minute5_bidData = (bidData) => API.post('/minute5_bidData/', bidData);
 export const fastParityBidData = (bidData) => API.post('/fastParity_bidData/', bidData);
 export const bigsmallBidData = (bidData) => API.post('/bigsmall_bidData/', bidData);

 export const bank = (formData) => API.post('/addBank/', formData);
 export const upi = (formData) => API.post('/addUpi/', formData);
 export const reset = (formData) => API.post('/resetPassword/', formData);
 export const accountSecurity = (name) => API.post('/accountSecurity/', name);
 export const address = (formData) => API.post('/addAddress/', formData);
 export const createEnvelop = (formData) => API.post('/createEnvelop/', formData);

 