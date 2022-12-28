import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import { createBrowserRouter, RouterProvider,} from "react-router-dom";
import Category from './components/category';
import Categories from './components/categories';
import AddProduct from './components/addProduct';
import NavStrip from './components/navbar';
import EditProduct from './components/editProduct';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <NavStrip />,
    children: [
      {
        path: "/testCat",
        element: <Category />
      },
      {
        path: "/categories",
        element: <Categories />,
        children: [
          {
            path: ":level/:id",
            element: <Categories />
          }
        ]
      },
      {
        path: "/addProduct",
        element: <AddProduct />
      },
      {
        path:"/editProduct/:id",
        element:<EditProduct/>
      }
    ]
  },

]);



root.render(
  // <React.StrictMode>
   
   
    <RouterProvider router={router} />
  
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
