import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

const Navbar = () => { 

    const { user } = useContext(UserContext);
    return ( 
        <div className="w-full flex justify-between items-center p-4 bg-gray-200">
            <div className="text-left">{user ? user.name : ''}</div>
            <div className="text-center flex-grow">Beffudled</div>
            <button>
                Logout
            </button>
        </div>
    )
}

export default Navbar;