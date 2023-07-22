import React from 'react'
import ReactDOM from 'react-dom/client'

import { AuthContext, AuthService } from 'services'
import App from './App'
import './index.css'
import { Helmet } from 'react-helmet';

const title: string = import.meta.env.VITE_APPLICATION_NAME;

const MainComponent = (props: any) => {
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <AuthContext.Provider
        value={{
          userInfo: props.userInfo,
          logout: props.doLogout,
          hasRole: props.hasRole
        }}
      >
        <App />
      </AuthContext.Provider>
    </>
  )
}

const renderApp = () => {

  AuthService.getUserInfo()
    .then(async (userInfo: any) => {
      return ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
        <MainComponent userInfo={userInfo} doLogout={AuthService.doLogout} hasRole={AuthService.hasRole} />,
      )
    }
    )
    .catch((err: any) => {
      console.log("error " + err);
    });
};

//@ts-ignore
AuthService.initKeycloak(renderApp);