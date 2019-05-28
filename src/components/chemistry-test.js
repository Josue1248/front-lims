import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import Modal from './modal.js';

export default class ChemistryTest extends React.Component{
    constructor(props){
        super(props);
        this.state={
            name: 'Prueba de quimico',
            operator: '',
            messageOp: '',
            validOp: undefined,
            chemistry: '',
            messageCh: '',
            validCh: undefined,
            sample: '',
            messageSample: '',
            validSample: undefined,
            messageAPI: '',
            showModal: false,
            loading: false,
        }
        this.handleSample = this.handleSample.bind(this);
        this.handleRegex = this.handleRegex.bind(this);
        this.handleSampleStatus = this.handleSampleStatus.bind(this);
        this.handleValidateSamples = this.handleValidateSamples.bind(this);
        this.handleOnBlur = this.handleOnBlur.bind(this);
        this.handleOperator = this.handleOperator.bind(this);
        this.handleChemistry = this.handleChemistry.bind(this);
        this.handleChemistryValidation = this.handleChemistryValidation.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    handleSample(e) {
        const sample = e.target.value

        if(sample.length <= 11){
            this.setState({
                sample: sample,
            })
        }
    }

    handleRegex(sample) {
        if (!(/MU-\d\d-\d\d\d\d\d/.test(sample)) && sample !== '') {
            this.setState({
                messageSample: 'Error de sintaxis',
            })
            return false
        } else {
            this.setState({
                messageSample: '',
            })
            return true
        }
    }

    handleSampleStatus(sample) {
            axios.get(`http://localhost:4000/api/samples/${sample}`)
            .then(res => {
                const state = res.data.estados[res.data.estados.length - 1].estado === 'Muestra lista para prueba de quimica' ? true : false

                if (!state) {
                    this.setState({
                        messageSample: 'La muestra no tiene el estado requerido',
                        validSample: false
                    })
                } else {
                    this.setState({
                        messageSample: '',
                        validSample: true
                    })
                }
            })
            .catch( () => {
                alert('Conection Timed Out');
            });
    }

    handleValidateSamples(sample) {
        if(this.handleRegex(sample)){
            this.handleSampleStatus(sample)
        } else {
            this.setState({
                validSample: false
            })
        }
    }

    handleOnBlur(e) {
        const sampleNumber = parseInt(e.target.name.replace('sample',''), 10) - 1
        const sample = e.target.value

        if(sample !== '') {
            this.handleValidateSamples(sample, sampleNumber)
        }
    }

    handleOperator(e) {
        const operator = e.target.value

        if(operator.length <= 5){
            this.setState({
                operator: operator,
            })
        }
    }

    handleChemistry(e) {
        const chemistry = e.target.value

        if(chemistry.length <= 8){
            this.setState({
                chemistry: chemistry,
            })
        }
    }

    handleChemistryValidation(e) {
        const chemistry = e.target.value

        if(/QU-\d\d\d\d\d/.test(chemistry)) {
            this.setState({
                validCh: true,
                messageCh: '',
            })
            axios.get(`http://localhost:4000/api/attributes/` + chemistry) 
            .then(res => {
                console.log(res.data)
                if(res.data.message) {
                    this.setState({
                        messageCh: res.data.message,
                    })
                } else {
                    this.setState({
                        messageCh: '',
                    })
                }
            })
        } else if(chemistry.trim() === '') {
            this.setState({
                messageCh: '',
                validCh: false,
            })
        } else {
            this.setState({
                messageCh: 'Error de syntaxis',
                validCh: false,
            })
        }
        
    }

    handleSubmit(event) {
        event.preventDefault();

        const operator = this.state.operator
        const chemistry = this.state.chemistry
        const sample = this.state.sample

        this.setState({
            loading: true
        })
        axios.post(`http://localhost:4000/api/test-forms/add`,{
            operator: operator,
            test: this.state.name,
            samples: [sample],
            attributes:[{
                name: 'Quimico',
                value: chemistry
            }],
            states: ["Prueba de quimica pasada", "Muestra lista para prueba de centrifugado"]
        })
        .then( res => {
            if(res.data.success === true) {
                this.setState({
                    sample: '',
                    messageAPI: res.data.message,
                    validSample: false,
                    showModal: true,
                    loading: false,
				});
				ReactDOM.findDOMNode(this.refs.firstSample).focus();
            } else {
				this.setState({
                    messageAPI: res.data.message,
                    showModal: true,
					loading: false,
				})
			}
        })
        .catch( () => {
			this.setState({
                messageAPI: 'Fallo en la conexion',
                showModal: true,
				loading: false
			});
        });
    }

    hideModal() {
        this.setState({ 
            showModal: !this.state.showModal 
        });
    };

    render(){
        const format = 'MU-##-#####'
        const regularLabels = 'col-md-12 col-sm-12 col-lg-2 col-xl-2 d-block'
        const inputs = 'col-md-12 col-sm-12 col-lg-5 col-xl-5 form-control'
        const warningLabels = 'col-md-12 col-sm-12 col-lg-10 col-xl-10 text-danger text-center'

        return(<div className='row justify-content-center m-0'>
            <div className='col-12 m-4'>
                <h1 className='text-center'>{this.state.name}</h1>
            </div>
            <div className='col-sm-12 col-xl-10'>
                <form onSubmit={this.handleSubmit}>
                    <div className='row justify-content-center form-inline mb-3'>
                            <label className={regularLabels}>Operador:</label>
                            <input 
                                type='text' 
                                value={this.state.operator}
                                className={inputs}
                                name='operator' 
                                placeholder='#####'
                                onChange={this.handleOperator}
                            />
                            <label className={warningLabels}>{this.state.messageOp}</label>
                        </div>
                    <div className='row justify-content-center form-inline mb-3'>
                            <label className={regularLabels}>Químico:</label>
                            <input 
                                type='text' 
                                value={this.state.chemistry}
                                className={inputs}
                                name='chemistry'
                                placeholder='QU-#####'
                                onChange={this.handleChemistry}
                                onBlur={this.handleChemistryValidation}
                            />
                            <label className={warningLabels}>{this.state.messageCh}</label>
                        </div>
                    <div>
                        <h5 className='text-center m-4'>Código</h5>
                        <div className='row justify-content-center form-inline mb-3'>
                            <label className={regularLabels}>Muestra 1:</label>
                            <input 
                                type='text'
                                className={inputs}
                                name={'sample1'}
                                value={this.state.sample}
                                placeholder={format}
                                onBlur={this.handleOnBlur}
                                onChange={this.handleSample}
                                ref='firstSample'
                            />
                            <label className={warningLabels}>{this.state.messageSample}</label> 
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <button
                            type='submit'
                            className='btn button col-md-6 col-sm-10 col-lg-3'
                            disabled={(/\d{5}/g.test(this.state.operator) && this.state.validCh && this.state.validSample) ? false : true}
                            title={(this.state.validSamples && this.state.validCh && /\d{5}/g.test(this.state.operator)) ? 'La forma esta lista' : 'La forma no esta lista'}
                        >
                        Guardar
                        {(this.state.loading) ? <img src='/images/spinner.gif' alt='loading' id='spinner'/> : ''}
                        </button>
                    </div>
                </form>
                <Modal 
                    showModal={this.state.showModal} 
                    handleClose={this.hideModal}
                    title={this.state.name}
                    message={this.state.messageAPI}
                />
            </div>
        </div>)
    }
}
