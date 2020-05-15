import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState } from 'react';
import { useContext } from 'react'
import { UserContext } from '../userContext';
/*
    Creates a navigation bar for users. Allows them access to their dashboard,
    settings, and logout options.
*/
export default function NavigationMenu(props) {
    let user = useContext(UserContext)
    return (
        <div>
            <header id="navigation-container">
                <div className="container">
                    <div id="navigation-content">
                        <a href="/assignments">
                            <div id="logo">
                                <h1>Canvas grading extension</h1>
                            </div>
                        </a>
                        <div id="user-profile-icon" className={user?.name == undefined ? 'hide' : ''}>
                            <Dropdown>
                                <Dropdown.Toggle variant="link" id="dropdown-basic">
                                    {`Hello, ${user?.name}`}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item href="/assignments">My workload</Dropdown.Item>
                                    <Dropdown.Item href="/dashboard">Dashboard</Dropdown.Item>
                                    <Dropdown.Item href="/settings">Setting</Dropdown.Item>
                                    <Dropdown.Item href="http://localhost:5000/auth/logout">Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
}

