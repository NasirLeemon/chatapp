import { Link } from "react-router-dom";
import logoImage from "../../assets/images/chat-app-logo-icon-removebg-preview.png" 
import { userLoggedOut } from "../../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import gravatarUrl from "gravatar-url";



export default function Navigation() {
    const dispatch = useDispatch()
    const {user} = useSelector(state => state.auth || {})
    const { email, name } = user || {} 
    const handleClick = () => {
        dispatch(userLoggedOut())
        localStorage.clear()
    }
    return (
        <nav className="border-general sticky top-0 z-40 border-b bg-violet-700 transition-colors">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/">
                        <img
                            className="h-14 p-2"
                            src={logoImage}
                            alt="Learn with Sumit"
                        />
                    </Link>
                    <ul className="flex gap-5">
                    <div>
                    <img src={gravatarUrl(email, { size: 35 })} alt="User" />
                    <p className="text-xs text-white">{name}</p>
                    </div>
                        <li className="text-white" >
                           
                            <span cursor='true' onClick={handleClick}>Logout</span>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
