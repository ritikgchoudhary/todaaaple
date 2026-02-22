import React from "react";
import ReactDom from "react-dom";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import { reducers } from './reducers';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';




const store = createStore(reducers, compose(applyMiddleware(thunk)));

ReactDom.render(
  <BrowserRouter>
  <Provider store={store}>
  {/* {window.location.replace(`https://game.toddapples.com`)} */}
{/* 
    <h5 style={{padding: '30px'}}>As per the Gaming bill 2025, Cash games are discountinued.</h5>
    <h5 style={{padding: '30px'}}>Stay Tuned - We will be back soon</h5> */}

  <App />
  </Provider>
   
  </BrowserRouter>,

  document.getElementById("root")
);
