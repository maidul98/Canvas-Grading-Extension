import React, { Component } from 'react';
import {Link} from "react-router-dom";

class NavigationMenu extends Component {

    render(){
      return (
        <header id="navigation-container">
            <div className="container">
                <div id="navigation-content">
                    <div id="logo">
                        <h1>Canvas grading extension</h1>
                    </div>
                    <div id="user_menu">
                        <ul id="user_menu_nav">
                            <li><a href="#">Profile</a></li>
                            <li><a href="#">Setting</a></li>
                            <li><a href="#">Logout</a></li>
                        </ul>
                    </div>
                </div>
                
            </div>
        </header>
      )
    }
  }

  export default NavigationMenu;
