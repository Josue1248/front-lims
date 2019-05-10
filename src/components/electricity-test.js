import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

export default class ElectricityTest extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            name: 'Prueba de electricidad',     //Name of the test
            operator: 0,                        //State of the operator
            messageOp: '',                      //Message for the operator field
            validOp: undefined,                 //Validation state of the operator
            samples: Array(10).fill(''),        //Array of samples
            messageSamples: Array(10).fill(''), //Array of messages for the samples
            rightSamples: Array(10).fill(''),
            validSamples: false,                //Validation state of the samples
            messageAPI: '',                     //Message of the API
            loading: false,                     //Loading state
        }
    }
    
    /* Update the samples in their position in the array */
    updateSamples=(value, position)=>{
        this.setState((state)=>{
            let samples = state.samples.map((sample, index)=>{
                if(position === index){
                    return sample = value
                } else {
                    return sample;
                }
            })
            return {
                samples,
            };
        })
    }

    /* Update the samples messages in their position in the array */
    updateSamplesMessage=(value, position)=>{
        this.setState((state)=>{
            const messageSamples = state.messageSamples.map((message, index)=>{
                if(index === position){
                    return message = value
                } else {
                    return message;
                }
            })
            return {
                messageSamples,
            };
        })
    }

    updateValidSamples=(value, position)=>{
        this.setState((state)=>{
            const rightSamples = state.rightSamples.map((status, index)=>{
                if(index === position){
                    return status = value
                } else {
                    return status;
                }
            })
            return {
                rightSamples,
            };
        })
    }

    /* Validation of the sample */
    validateSample = (sample, sampleNumber) => {
        if (!(/MU-\d\d-\d\d\d\d\d/.test(sample)) && sample !== ''){
            this.updateSamplesMessage('Incorrect syntax', sampleNumber)
            this.updateValidSamples(false, sampleNumber)
        } else if(sample === ''){
            this.updateSamplesMessage('', sampleNumber)
            this.updateValidSamples('', sampleNumber)
        } else {
            this.updateSamplesMessage('', sampleNumber)
            
            axios.get(`http://localhost:4000/api/samples/${sample}/`)
            .then(res => {
                if (res.data.estado !== 'Nueva muestra') {
                        this.updateSamplesMessage('La muestra no es nueva', sampleNumber)
                        this.updateValidSamples(false, sampleNumber)
                } else {
                    this.state.samples.forEach((value,index)=>{
                        if(sample === value && index !== sampleNumber){
                            this.updateSamplesMessage('This sample is repeated', sampleNumber)
                            this.updateValidSamples(false, sampleNumber)
                        }
                    })
                }
            })
            .catch( () => {
                alert('Conection Timed Out');
            });
            this.updateValidSamples(true, sampleNumber)
        }
    }

    handleValidSamples = (sampleNumber) => {
        if(sampleNumber < this.state.samples.length){
            if(this.state.rightSamples[sampleNumber] === false) {
                this.setState({
                    validSamples: false,
                })
                this.validateSample(this.state.samples[sampleNumber], sampleNumber)
            } else if(this.state.rightSamples[sampleNumber] === ''){
                console.log('nothing')
                this.handleValidSamples(sampleNumber + 1)
            } else {
                this.setState({
                    validSamples: true,
                })
                this.handleValidSamples(sampleNumber + 1)
            }
        }
    }

    /* Add the sample from the input to the array, limiting the length of the value */
    handleSample=(e)=>{
        const sampleNumber = parseInt(e.target.name.replace('sample',''),10)
        const sample = e.target.value

        this.handleValidSamples(0)
        if(sample.length <= 11){
            this.updateSamples(sample,sampleNumber - 1)
            this.validateSample(sample,sampleNumber - 1)
        }
    }

    /* Clear the inputs */
    clearSamples=(sampleNumber)=>{
        if(sampleNumber < this.state.samples.length) {
            this.updateSamples('', sampleNumber)
            this.updateSamplesMessage('', sampleNumber)
            this.updateValidSamples('', sampleNumber)
            this.clearSamples(sampleNumber + 1)
            if(sampleNumber === 1){
                this.setState({
                    validSamples: false,
                })
            }
        }
    }

    /* Handle the blanks inputs */
    handleBlanks=(e)=>{
        const sampleNumber = parseInt(e.target.name.replace('sample',''),10)
        const sample = e.target.value

        this.handleValidSamples(0)
        if(sample === ''){
            this.clearSamples(sampleNumber)
        }
    }

    /* Add the operator number and validate it */
    handleOperator=(e)=>{
        const operator = e.target.value

        if(/[1-99999]/.test(operator) && operator.length <= 5){
            axios.get(`http://localhost:4000/api/operators/` + operator) 
            .then(res => {
                if (res.data.message) { 
                    this.setState({
                        messageOp: 'El operador no existe',
                        validOp: false,
                    })
                } else  {
                    this.setState({
                        operator: operator,
                        messageOp: '',
                        validOp: true,
                    })
                }
            })
            .catch( () => {
                alert('Conection Timed Out');
            });
        }else if(operator === ''){
            this.setState({
                messageOp: 'El campo no puede estar vacio', //that's racist
                validOp: undefined,
            })
        }else{
            this.setState({
                validOp: false,
                messageOp: 'Error de sintaxis',
            })
        }
    }

    /* Submit of the sample */
    handleSubmit = (event) => {
        event.preventDefault();

        this.setState({
            loading:true
        })

        const operator = this.state.operator

        const samples = this.state.samples.filter((sample)=>{return ((/SA-\d\d-\d\d\d\d\d/.test(sample) && sample.length === 11))})
   
		axios.post(`http://localhost:4000/api/test-forms/add`,{
			operator,
			test: this.state.name,
			samples: samples,
		})
		.then( res=> {
			if (res.data.message === 'Insertion completed') {
				this.setState({
					operator: 0, 
                    samples: Array(10).fill(''),
                    rightSamples: Array(10).fill(false),
					messageAPI: res.data.message,
					validSamples: false,
					loading: false
				})
				ReactDOM.findDOMNode(this.refs.firstSample).focus();
			} else {
				this.setState({
					loading: false,
				})
			}
			})
		.catch( () => {
			alert('Conection Timed Out');
			this.setState({
				loading: false
			});
		});
    }

    /* Render function of the component*/
    render(){
        const {
            handleSubmit,
            handleOperator,
            handleSample,
            handleBlanks,
            state: {
                name,
                messageOp,
                validOp,
                messageSamples,
                rightSamples,
                validSamples,
                messageAPI,
                samples,
            }
        } = this;

        const format = 'MU-##-#####'
        const regularLabels = 'col-md-12 col-sm-12 col-lg-2 col-xl-2 d-block'
        const inputs = 'col-md-12 col-sm-12 col-lg-5 col-xl-5 form-control'
        const warningLabels = 'col-md-12 col-sm-12 col-lg-10 col-xl-10 text-danger text-center'

        let operatorInput = inputs

        if(validOp === false){
            operatorInput = operatorInput += ' border-danger'
        }else if(validOp === true){
            operatorInput = operatorInput += ' border-success'
        }else{
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
                            onBlur={handleOperator}
                        />
                        <label className={warningLabels}>{messageOp}</label>
                    </div>
                    <div>
                        <h5 className='text-center m-4'>Códigos</h5>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 1:</label>
                            <input 
                                value={samples[0]}
                                type='text'
                                className={inputs}
                                name={'sample1'} 
                                placeholder={format}
                                onBlur={handleBlanks}
								onChange={handleSample}
								ref='firstSample'
                            />
							<label className={warningLabels}>{messageSamples[0]}</label>
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 2:</label>
                            <input
                                value={samples[1]}
                                type='text'
                                className={inputs}
                                name={'sample2'}
                                placeholder={format}
                                disabled={(rightSamples[0] !== true) ? true : false}
                                onBlur={handleBlanks}
                                onChange={handleSample}
                            />
                            <label className={warningLabels}>{messageSamples[1]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 3:</label>
                            <input 
                                type='text'
                                value={samples[2]}
                                className={inputs}
                                name={'sample3'} 
                                placeholder={format}
                                disabled={(rightSamples[1] !== true) ? true : false}
                                onBlur={handleBlanks}
                                onChange={handleSample}
                            />
                            <label className={warningLabels}>{messageSamples[2]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 4:</label>
                            <input 
                                type='text'
                                value={samples[3]}
                                className={inputs}
                                name={'sample4'} 
                                placeholder={format}
                                disabled={(rightSamples[2] !== true) ? true : false}
                                onBlur={handleBlanks}
                                onChange={handleSample}
                            />
                            <label className={warningLabels}>{messageSamples[3]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 5:</label>
                            <input 
                                type='text'
                                value={samples[4]}
                                className={inputs}
                                name={'sample5'} 
                                placeholder={format}
                                disabled={(rightSamples[3] !== true) ? true : false}
                                onBlur={handleBlanks}
                                onChange={handleSample}
                            />
                            <label className={warningLabels}>{messageSamples[4]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 6:</label>
                            <input 
                                type='text'
                                value={samples[5]}
                                className={inputs}
                                name={'sample6'} 
                                placeholder={format}
                                disabled={(rightSamples[4] !== true) ? true : false}
                                onBlur={handleBlanks}
                                onChange={handleSample}
                            />
                            <label className={warningLabels}>{messageSamples[5]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 7:</label>
                            <input 
                                type='text'
                                value={samples[6]}
                                className={inputs}
                                name={'sample7'} 
                                placeholder={format}
                                disabled={(rightSamples[5] !== true) ? true : false}
                                onBlur={handleBlanks}
                                onChange={handleSample}
                            />
                            <label className={warningLabels}>{messageSamples[6]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 8:</label>
                            <input 
                                type='text'
                                value={samples[7]}
                                className={inputs}
                                name={'sample8'} 
                                placeholder={format}
                                disabled={(rightSamples[6] !== true) ? true : false}
                                onBlur={handleBlanks}
                                onChange={handleSample}
                            />
                            <label className={warningLabels}>{messageSamples[7]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 9:</label>
                            <input 
                                type='text'
                                value={samples[8]}
                                className={inputs}
                                name={'sample9'} 
                                placeholder={format}
                                disabled={(rightSamples[7] !== true) ? true : false}
                                onBlur={handleBlanks}
                                onChange={handleSample}
                            />
                            <label className={warningLabels}>{messageSamples[8]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 10:</label>
                            <input 
                                type='text'
                                value={samples[9]}
                                className={inputs}
                                name={'sample10'}
                                placeholder={format}
                                disabled={(rightSamples[8] !== true) ? true : false}
                                onBlur={handleBlanks}
                                onChange={handleSample}
                            />
                            <label className={warningLabels}>{messageSamples[9]}</label>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
					<button
                        type='submit'
                        className='btn btn-success col-md-6 col-sm-10 col-lg-3'
                        disabled={(validSamples && validOp) ? false : true}
                        title={(validSamples && validOp) ? 'Form is ready' : 'Form not ready'}
                    >
                    Guardar
                    {(this.state.loading) ? <img src='/images/spinner.gif' alt='loading' id='spinner'/> : ''}
                    </button>
					</div>
					<div className='row justify-content-center'>
					<label id='succes' className={'col-lg-3 col-sm-10 text-center col-md-6  mt-3'}>
                    {messageAPI}
                    </label>
					</div>
                </form>
            </div>
        </div>)
    }
}