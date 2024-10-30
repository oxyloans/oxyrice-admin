import React from 'react';
import { FaSignOutAlt, FaShoppingCart, FaUserAlt } from 'react-icons/fa';
import Logo from '../assets/img/ericelogo.webp';

const Header = () => {
    return (
        <header className="fixed top-0 left-0 w-full flex items-center justify-between px-4 py-2 bg-gray-800 text-white shadow-lg z-50">
            {/* Logo */}
            <div className="flex items-center">
                {/* Logo with scale hover effect */}
                <div className="bg-white h-12 w-12 rounded-full flex items-center justify-center transform transition-transform duration-500 ease-in-out hover:scale-110">
                    <img src={Logo} alt="Logo" className="h-8 w-8" /> {/* Adjust size as necessary */}
                </div>

                {/* Text with fade-in and slide effect */}
                <span className="ml-3 text-2xl font-semibold">
                    E-<span className="text-yellow-500">rice</span> {/* Specify the shade */}
                </span>
            </div>

            {/* Navigation and Icons */}
            <nav className="flex items-center space-x-6">
                <a href="#" className="text-white hover:text-gray-300 transition duration-300 ease-in-out">Dashboard</a>
                <a href="#" className="text-white hover:text-gray-300 transition duration-300 ease-in-out">Settings</a>
                <a href="#" className="text-white hover:text-gray-300 transition duration-300 ease-in-out">Profile</a>
                <a href="#" className="text-white hover:text-gray-300 transition duration-300 ease-in-out">Help</a>

                {/* User and Cart icons */}
                <div className="flex items-center space-x-3">
                    <a href="#" className="relative text-white hover:text-gray-300 transition duration-300 ease-in-out">
                        <FaShoppingCart size={24} />
                        <span className="absolute -top-2 -right-3 bg-red-600 text-xs text-white font-semibold rounded-full h-5 w-5 flex items-center justify-center">3</span>
                    </a>
                    <a href="#" className="text-white hover:text-gray-300 transition duration-300 ease-in-out">
                        <FaUserAlt size={24} />
                    </a>
                    <button className="flex items-center bg-transparent border border-white rounded-lg px-4 py-2 hover:bg-white hover:text-teal-600 transition duration-300 ease-in-out">
                        <FaSignOutAlt className="mr-2" /> Log out
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Header;
