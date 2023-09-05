import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../features/api/apiSlice';
import authReducer  from '../features/auth/authSlice'
import messagesReducer  from '../features/messages/messagesSlice'
import conversationReducer from '../features/conversations/conversationSlice'

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath] : apiSlice.reducer,
    auth : authReducer,
    messages : messagesReducer,
    conversation : conversationReducer,
  },
  devTools : process.env.NODE_ENV !== 'production',
  middleware : (getDefaultMiddlewares) => 
    getDefaultMiddlewares().concat(apiSlice.middleware)
  
});
