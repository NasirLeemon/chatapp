import React from 'react'
import useAuth from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
  const isLoggedIn = useAuth()

  //  !isLoggedIn && alert('Please Log In First.')

  return isLoggedIn ? children : <Navigate to='/' />
}

export default PrivateRoute