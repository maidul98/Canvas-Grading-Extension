import React, { Component } from 'react';

class NavigationMenu extends Component {

    render(){
      return (
        <header id="navigation-container">
            <div className="container">
                <div id="navigation-content">
                    <div id="logo">
                        <h1>Canvas grading extension</h1>
                    </div>
                    <div id="user-profile-icon" onClick={userProfileOnClick}>
                        <div id="user_menu">
                            <ul id="user_menu_nav">
                                <li>Profile</li>
                                <li>Setting</li>
                                <li>Logout</li>
                            </ul>
                        </div>
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
