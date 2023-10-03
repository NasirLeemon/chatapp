import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";
import io from 'socket.io-client'

export const conversationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getConversations: builder.query({
            query: (email) => `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
            transformErrorResponse(apiResponse, meta){
                const totalCount = meta.response.headers.get('X-Total-Count')
                console.log(totalCount);
                return {
                    data: apiResponse,
                    totalCount,
                }
            },

            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved}){
                // create soket
                const socket = io('http://localhost:9000', {
                    reconnectionDelay : 1000,
                    reconnection : true,
                    reconnectionAttempts: 10,
                    transports: ['websocket'],
                    agent : false,
                    upgrade : false,
                    rejectUnauthorized : false,
                })

                try {
                    await cacheDataLoaded
                    socket.on('conversation', (data)=>{
                        updateCachedData((draft)=>{
                            // eslint-disable-next-line eqeqeq
                            const conversation = draft.find((c) => c.id == data?.data?.id)
                            if(conversation?.id){
                                conversation.message = data?.data?.message
                                conversation.timestamp = data?.data?.timestamp
                            }else {

                            }

                        })
                    })
                } catch (error) {
                    
                }

                await cacheEntryRemoved;
                socket.close()
            }


        }),
        getMoreConversations: builder.query({
            query: ({email, page}) => `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,

            async onQueryStarted({email, page}, { queryFulfilled, dispatch }) {

                

                try {
                    const conversations = await queryFulfilled
                    if (conversations?.length > 0) {
                        //conversation pessimistic cache update start
                        dispatch(apiSlice.util.updateQueryData('getConversations', email, (draft) => {
                           return [...draft, ...conversations]
                        }))     
                        //conversation pessimistic cache update end

                    }
                } catch (error) {}
            },


        }),
        getConversation: builder.query({
            query: ({ userEmail, partnerEmail }) => `/conversations?participants_like=${userEmail}-${partnerEmail}&&participants_like=${partnerEmail}-${userEmail}`
        }),
        addConversation: builder.mutation({
            query: ({ sender, data }) => ({
                url: `/conversations`,
                method: 'POST',
                body: data
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                // optimistic cache update start
                const patchResult2 = dispatch(apiSlice.util.updateQueryData('getConversations', arg.sender,
                    (draft) => {
                        draft.push(arg.data)
                    }))
                // optimistic cache update end


                try {
                    const conversation = await queryFulfilled
                    if (conversation?.data.id) {
                        // silent entry to messages
                        const users = arg.data.users
                        const senderUser = users.find(user => user.email === arg.sender)
                        const ReceiverUser = users.find(user => user.email !== arg.sender)

                        dispatch(messagesApi.endpoints.addMessage.initiate({
                            conversationId: conversation?.data.id,
                            sender: senderUser,
                            receiver: ReceiverUser,
                            message: arg.data.message,
                            timestamp: arg.data.timestamp,
                        }))
                    }
                } catch (err) {
            
                    patchResult2.undo()
                }
            }
        }),
        editConversation: builder.mutation({
            query: ({ id, data, sender }) => ({
                url: `/conversations/${id}`,
                method: 'PATCH',
                body: data,
            }),
            
        })

    }),

})


export const { useGetConversationsQuery, useAddConversationMutation, useEditConversationMutation, useGetConversationQuery } = conversationApi
