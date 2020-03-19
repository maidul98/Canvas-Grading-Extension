import React, { Component } from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'

class NavigationMenu extends Component {
    render(){
    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <div id="user-profile-icon" ref={ref} onClick={e => { e.preventDefault(); onClick(e); }}>{children}</div>
        ));
          
      return (
        <header id="navigation-container">
            <div className="container">
                <div id="navigation-content">
                    <div id="logo">
                        <h1>Canvas grading extension</h1>
                    </div>
                    <div id="user-profile-icon">
                        <Dropdown>
                            <Dropdown.Toggle as={CustomToggle}></Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item href="#/action-1">Profile</Dropdown.Item>
                                <Dropdown.Item href="#/action-2">Setting</Dropdown.Item>
                                <Dropdown.Item href="#/action-3">Logout</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>

            </div>
        </header>
      )
    }
  }

  function userProfileOnClick(){
      document.getElementById('user_menu_nav').classList.toggle('show');
  }

  export default NavigationMenu;
