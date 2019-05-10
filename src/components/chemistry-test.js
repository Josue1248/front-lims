import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

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
            loading: false,
        }
    }

    handleSample = (e) => {
        const sample = e.target.value

        if(sample.length <= 11) {
            this.setState({
                sample: sample,
            })
            if(!(/MU-\d\d-\d\d\d\d\d/.test(sample)) && sample !== '') {
                this.setState({
                    messageSample: 'Incorrect syntax',
                    validSample: false,
                })
            } else if(sample === '') {
                this.setState({
                    messageSample: '',
                    validSample: false,
                })
            } else {
                axios.get(`http://localhost:4000/api/samples/${sample}`)
                .then(res => {
                    console.log(res.data.estado)
                    if(res.data.estado === 'Muestra lista para prueba de química' || res.data.message === 'Muestra usada') {
                        this.setState({
                            messageSample: '',
                            validSample: true,
                        })
                    } else {
                        this.setState({
                            messageSample: 'La muestra no tiene el estado requerido',
                            validSample: false,
                        })
                    }
                })
                .catch( () => {
                    alert('Conection Timed Out');
                    this.setState({
                        loading: false,
                        validSample: false,
                    }); });
            }
        }   
    }

    handleOperator = (e) => {
        const operator = e.target.value

        if(/[1-99999]/.test(operator) && operator.length <= 5){
            axios.get(`http://localhost:4000/api/operators/` + operator) 
            .then(res => {
                if(res.data.message) { 
                    this.setState({
                        messageOp: res.data.message,
                        validOp: false,
                    })
                } else {
                    this.setState({
                        operator: operator,
                        messageOp: '',
                        validOp: true,
                    })
                }
            })
        } else if(operator==='') {
            this.setState({
                messageOp: 'Field can\'t be blank', //that's racist
                validOp: undefined,
            })
        } else {
            this.setState({
                validOp: false,
                messageOp: 'Invalid Syntax',
            })
        }
    }

    handleChemistry = (e) =>{
        const chemistry = e.target.value

        if(chemistry.length <= 8){
            this.setState({
                chemistry: chemistry,
            })
        }
    }

    handleValidationChemistry = (e) => {
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
        } else if(chemistry === '') {
            this.setState({
                messageCh: '',
                validCh: false,
            })
        } else {
            this.setState({
                messageCh: 'Invalid syntax',
                validCh: false,
            })
        }
        
    }

    handleSubmit = (event) => {
        event.preventDefault();

        const operator = this.state.operator
        const chemistry = this.state.chemistry
        const sample = this.state.sample
        this.setState({
            loading:true
        })
        axios.post(`http://localhost:4000/api/test-forms/add`,{
            operator: operator,
            test: this.state.name,
            samples: [sample],
            attributes:[{
                name: 'Quimico',
                value: chemistry
            }]
        })
        .then( res => {
            if(res.data.message === 'Insertion completed') {
				console.log(res.data.message)
                this.setState({
                    sample: '',
                    messageAPI: res.data.message,
                    validSample: false,
                    loading: false,
				});
				ReactDOM.findDOMNode(this.refs.firstSample).focus();
            } else if(res.data.message === 'Samples are wrong') {
                this.setState({
                    messageAPI: 'Sample went through the test already'
                });
            } else if(res.data.message === 'This sample already passed this test') {
                this.setState({
                    messageAPI: 'This sample already passed this test'
                });
            } else {
                console.log(res.data.message)
                this.setState({
                    messageAPI: 'The sample is not ready for this test'
                });
            }
        })
        .catch( () => {
            alert('Conection Timed Out');
            this.setState({
                loading: false
            });
        });
    }

    render(){
        const {
            handleSubmit,
            handleOperator,
            handleChemistry,
            handleValidationChemistry,
            handleSample,
            state: {
                name,
                messageOp,
                validOp,
                chemistry,
                messageCh,
                validCh,
                sample,
                messageSample,
                validSample,
                messageAPI,
            }
        } = this;

        const format = 'MU-##-#####'
        const regularLabels = 'col-md-12 col-sm-12 col-lg-2 col-xl-2 d-block'
        const inputs = 'col-md-12 col-sm-12 col-lg-5 col-xl-5 form-control'
        const warningLabels = 'col-md-12 col-sm-12 col-lg-10 col-xl-10 text-danger text-center'

        let operatorInput = inputs;

        if(validOp === false){
            operatorInput = operatorInput += ' border-danger'
        }else if(validOp === true){
            operatorInput = operatorInput += ' border-success'
        }
        else{
            operatorInput = inputs
        }

        return(<div className='row justify-content-center m-0'>
            <div className='col-lg-4 col-sm-12 m-4'>
                <h1 className='text-center'>{name}</h1>
            </div>
            <div className='col-sm-12 col-xl-10'>
                <form onSubmit={handleSubmit}>
                <div className='row justify-content-center form-inline mb-3'>
                        <label className={regularLabels}>Operador</label>
                        <input 
                            type='text' 
                            className={operatorInput}
                            name='operator' 
                            placeholder='#####'
                            onChange={handleOperator}
                        />
                        <label className={warningLabels}>{messageOp}</label>
                    </div>
                    <div className='row justify-content-center form-inline mb-3'>
                        <label className={regularLabels}>Químico:</label>
                        <input 
                            type='text' 
                            value={chemistry}
                            className={inputs}
                            name='chemistry'
                            placeholder='QU-#####'
                            onChange={handleChemistry}
                            onBlur={handleValidationChemistry}
                        />
                        <label className={warningLabels}>{messageCh}</label>
                    </div>
                    <div>
                        <h5 className='text-center m-4'>Código</h5>
                    <div className='row justify-content-center form-inline mb-3'>
                        <label className={regularLabels}>Muestra 1:</label>
                        <input 
                            type='text'
                            className={inputs}
                            name={'sample1'}
                            value={sample}
                            placeholder={format}
                            onChange={handleSample}
							ref='firstSample'
                        />
                        <label className={warningLabels}>{messageSample}</label> 
                    </div>
                    </div>
					<div className='row justify-content-center'>
                    <label className={'col-lg-3 col-sm-10 text-center col-md-6  mt-3'}><p id='succes'>{messageAPI}</p></label>
					</div>
                    <div className='row justify-content-center'>
                    <button
                        type='submit'
                        className='btn btn-success col-md-6 col-sm-10 col-lg-3'
                        disabled={(validOp && validCh && validSample) ? false : true}
                        title={(validSample && validOp) ? 'Form is ready' : 'Form not ready'}
                    >
                    Guardar
                    {(this.state.loading) ? <img src='/images/spinner.gif' alt='loading' id='spinner'/> : ''}
                    </button>
                    </div>
                </form>
            </div>
        </div>)
    }
}
