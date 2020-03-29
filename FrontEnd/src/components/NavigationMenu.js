import React, { Component } from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import {Link} from 'react-router-dom';
import {login, isLoggedIn, logout} from '../Auth/LoginActions';
import Button from 'react-bootstrap/Button'
import { Redirect } from "react-router-dom";

class NavigationMenu extends Component {
    render(){
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
                                    <Dropdown.Item onClick={()=> logout()} href="/">Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        :
                        <a href="/assignments" onClick={()=>login()} id="login-btn">Login</a>
                        // <Button href="/assignments" variant="link" onClick={() => login()}>Login</Button>
                        }
                    </div>
                </div>
            </header>
        );
    }
}

function userProfileOnClick(){
    document.getElementById('user_menu_nav').classList.toggle('show');
}

export default NavigationMenu;
