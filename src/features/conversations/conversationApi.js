import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";


export const conversationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getConversations: builder.query({
            query: (email) => `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`
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
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {

                // optimistic cache update start

                const patchResult1 = dispatch(apiSlice.util.updateQueryData('getConversations', arg.sender, (draft) => {
                    const draftConversation = draft.find(c => c.id === arg.id)
                    draftConversation.message = arg.data.message
                    draftConversation.timestamp = arg.data.timestamp
                }))

                // optimistic cache update end

                try {
                    const conversation = await queryFulfilled
                    if (conversation?.data.id) {

                        // silent entry to messages

                        const users = arg.data.users
                        const senderUser = users.find(user => user.email === arg.sender)
                        const ReceiverUser = users.find(user => user.email !== arg.sender)

                        const res = await dispatch(messagesApi.endpoints.addMessage.initiate({
                            conversationId: conversation?.data.id,
                            sender: senderUser,
                            receiver: ReceiverUser,
                            message: arg.data.message,
                            timestamp: arg.data.timestamp,
                        })).unwrap()
                        // pessimistic cache update start
                        dispatch(apiSlice.util.updateQueryData('getMessages', res.conversationId.toString(), (draft) => {
                           draft.push(res)
                        }))     
                        // pessimistic cache update end
                    }
                } catch (error) {
                    patchResult1.undo()
                }
            }
        })

    }),

})


export const { useGetConversationsQuery, useAddConversationMutation, useEditConversationMutation, useGetConversationQuery } = conversationApi
