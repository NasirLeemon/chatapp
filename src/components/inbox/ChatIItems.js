import { useSelector } from "react-redux";
import { useGetConversationsQuery } from "../../features/conversations/conversationApi";
import ChatItem from "./ChatItem";
import Error from "../ui/Error";
import moment from "moment";
import getPartnerinfo from "../utils/getPartnerInfo";
import gravatarUrl from "gravatar-url";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

export default function ChatItems() {
    const { user } = useSelector(state => state.auth || {})
    const { email } = user || {}
    const { data , isLoading, isError, error } = useGetConversationsQuery(email) || {}

    const {conversations, totalCount} = data || {}

    let content;

    if (isLoading) content = <li>Loading....</li>
    if (!isLoading && isError) content = <li><Error message={error?.data} /></li>
    if (!isLoading && !isError && conversations?.length === 0) content = <li>No Conversations found</li>
    if (!isLoading && !isError && conversations?.length > 0) content = 
    
    <InfiniteScroll
    dataLength={conversations?.length}  
    next={()=>console.log('Fetching next ')}
    hasMore={true}
    loader={<h4>Loading...</h4>}
    height={window.innerHeight - 129}
  >
        {
         conversations?.map(conversation => {
        const { id, message, timestamp, users } = conversation || {}
        const { name, email: partnerEmail } = getPartnerinfo(users, email)

        return <li key={id}>
            <Link to={`/inbox/${id}`}>

                <ChatItem
                    avatar={gravatarUrl(partnerEmail, { size: 80 })}
                    name={name}
                    lastMessage={message}
                    lastTime={moment(timestamp).fromNow()}
                />
            </Link>
        </li>
    }
    )
}</InfiniteScroll>
    

    return (
        <ul>
            {content}
        </ul>
    );
}
