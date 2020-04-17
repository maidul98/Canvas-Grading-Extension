import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { login, isLoggedIn, logout } from '../Auth/LoginActions';

/*
    Creates a navigation bar for users. Allows them access to their dashboard,
    settings, and logout options.
*/
class NavigationMenu extends Component {
    render() {
        const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
            <div id="user-profile-icon" ref={ref} onClick={e => { e.preventDefault(); onClick(e); }}>{children}</div>
        ));

        return (
            <header id="navigation-container">
                <div className="container">
                    <div id="navigation-content">
                        <a href="/assignments">
                            <div id="logo">
                                <h1>Canvas grading extension</h1>
                            </div>
                        </a>
                        {isLoggedIn()
                            ?
                            <div id="user-profile-icon">
                                <Dropdown>
                                    <Dropdown.Toggle as={CustomToggle}></Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item href="/dashboard">Dashboard</Dropdown.Item>
                                        <Dropdown.Item href="#/action-2">Setting</Dropdown.Item>
                                        <Dropdown.Item onClick={() => logout()} href="/">Logout</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                            :
                            <a href="/assignments" onClick={() => login()} id="login-btn">Login</a>
                        }
                    </div>
                </div>
            </header>
        );
    }
}

export default NavigationMenu;
