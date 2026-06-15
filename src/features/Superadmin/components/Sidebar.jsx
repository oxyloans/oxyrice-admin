import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../styles/glass.module.css';
import logo from '../../../assets/img/oxyglobal.png';

const links = [
  { to: '/superadmin/dashboard', label: 'Dashboard' },
  // { to: '/superadmin/employees', label: 'Employees' },
  { to: '/superadmin/companies', label: 'Companies' },
  { to: '/superadmin/banks', label: 'Banks' },
];

const Sidebar = () => (
  <aside className={styles.glassCard} style={{ width: '200px', height: '100vh', padding: '1rem', flexShrink: 0, overflowY: 'auto', backgroundColor: '#ffffff' }}>
    <div className="flex justify-center mb-6 py-2 border-b border-gray-200/50">
      <img src={logo} alt="OxyGlobal" className="h-10 object-contain" />
    </div>
    <nav>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `block py-2 px-3 rounded-md text-sm font-medium ${isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);

export default Sidebar;
