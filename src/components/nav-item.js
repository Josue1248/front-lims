import React from 'react';


export default class NavItem extends React.Component {

  onClick = () => {
    const { label, onClick } = this.props;
    onClick(label);
  }

  render() {
    const {
      onClick,
      props: {
        activeTest,
        label,
      },
    } = this;

    let className = 'btn btn-light w-100 rounded-0 shadow-none';

    if (activeTest === label) {
      className = 'btn btn-secondary w-100 rounded-0 shadow-none';
    }

    return (
        <button
            className={className}
            onClick={onClick}
            title={label}
            data-toggle='collapse'
            data-target='#bs-example-navbar-collapse-1'
            aria-expanded='false'
        >
        {label}
        </button>
        
    );
  }
}
