import React from 'react';

import NavItem from '../components/nav-item';

export default class Tests extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTest: 'Inicio',
    };
  }

  onClickTest = (test) => {
    this.setState({ activeTest: test });
  }

  render() {
    const {
      onClickTest,
      props: {
        children,
      },
      state: {
        activeTest,
      }
    } = this;

    return (<div className='fullHeight row m-0' >
        <nav className = 'col-lg-2 col-xl-2 col-md-12 col-sm-12 fixed-top bg-success' id='menuMobilDiv'>
            <div className='breadcrumb'>
                <div className='appLogoName bg-success w-100'>
                    <img src="images/mini-logo.png" className="appLogo pl-4" alt="lims logo"/>
                    <h1 className='text-white pl-1'>LIMS</h1>
                </div>
                <div>
                <ul className='m-0'>
                    {children.map((child) => {
                        const { label } = child.props;
                        return (
                        <NavItem
                            activeTest={activeTest}
                            key={label}
                            label={label}
                            onClick={onClickTest}
                        />
                        );})}
                </ul>
            </div>
            </div>
            <div className='navbar navbar-default navbar-inverse navbar-fixed-top' id='navMobil'>
                <div className='container-fluid navbar-header m-0'>
                    <button 
                        type='button' 
                        className='navbar-toggle collapsed w-100'
                        data-toggle='collapse' 
                        data-target='#bs-example-navbar-collapse-1' 
                        aria-expanded='false' 
                        id='menuButton'
                    >
                        <h3 className='mx-auto text-white pt-1'>LIMS</h3>
                        <img src='images/menu.png' className='buttonImage' alt='button menu'/>
                    </button>
                </div>
                <div className='collapse navbar-collapse' id='bs-example-navbar-collapse-1'>
                    <ul className='navbar navbar-nav'>
                    {children.map((child) => {
                        const { label } = child.props;
                    
                        return (
                        <NavItem
                            activeTest={activeTest}
                            key={label}
                            label={label}
                            onClick={onClickTest}
                        />
                        );})}
                    </ul>
                </div>
            </div>
        </nav>
        <div className='col-lg-10 col-xl-10 col-md-12 col-sm-12 offset-lg-2'>
            {children.map((child) => {
            if (child.props.label !== activeTest) return undefined;
            return child.props.children;
            })}
        </div>
    </div>
    );
  }
}
