import React from "react";

class Modal extends React.Component{

    handleClose = () => {
        this.props.handleClose()
    };

    render(){
        const {
            handleClose,
            props:{
                title,
                message,
                showModal,
            }
          } = this;

        const showHideClassName = showModal ? "modal display-block" : "modal display-none";
    
        return (
        <div className={showHideClassName} tabIndex="-1" role="dialog" aria-hidden={!showModal}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">{title}</h4>
                    </div>
                    <div className="modal-body">
                        <p className="text-center m-0">{message}</p>
                    </div>
                    <div className="modal-footer">
                        <button className={"btn button"}onClick={handleClose}>Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
        );
    }
}

export default Modal;