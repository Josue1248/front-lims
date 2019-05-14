import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

export default class HeatTest extends React.Component{
    constructor(props){
        super(props);
        this.state={
            name: 'Prueba de calor',
            operator: '',
            messageOp: '',
            validOp: undefined,
            temperature: 0,
            messageTemp: '',
            validTemp: undefined,
            time: 0,
            messageTime: '',
            validTime: undefined,
            samples: Array(5).fill(''),
            messageSamples: Array(5).fill(''),
            rightSamples: Array(5).fill(''),
            validSamples: undefined,
            loading: false,
        }
    }

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

    validateSample = (sample, sampleNumber) => {
        if (!(/MU-\d\d-\d\d\d\d\d/.test(sample)) && sample !== ''){
            this.updateSamplesMessage('Incorrect syntax', sampleNumber)
            this.updateValidSamples(false, sampleNumber)
        } else if(sample === ''){
            this.updateSamplesMessage('', sampleNumber)
            this.updateValidSamples('', sampleNumber)
        } else {
            this.updateSamplesMessage('', sampleNumber)
            axios.get(`http://localhost:4000/api/samples/${sample}`)
            .then(res => {
                if (res.data.estado !== "Muestra lista para prueba de calor" || res.data.message === 'Muestra usada') {
                    this.updateSamplesMessage(res.data.message, sampleNumber)
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
            } else {
                this.setState({
                    validSamples: true,
                })
                this.handleValidSamples(sampleNumber + 1)
            }
        }
    }

    handleTemperature = (event) => {
        if(event.target.value>0) {
            this.setState({
                temperature: event.target.value,
                messageTemp: '',
                validTemp: true,
            });
        } else if(event.target.value==='') {
            this.setState({
                messageTemp: 'El campo no puede estar vacio',
                validTemp: false,
            });
        } else {
            this.setState({
                messageTemp: 'El valor no puede ser 0',
                validTemp: false,
            });
        }
    }

    handleTime = (event) => {
        if(event.target.value>0) {
            this.setState({
                time: event.target.value,
                messageTime: '',
                validTime: true,
            });
        } else if(event.target.value==='') {
            this.setState({
                messageTime: 'El campo no puede estar en blanco',
                validTime: false,
            });
        } else {
            this.setState({
                messageTime: 'El valor no puede ser 0',
                validTime: false,
            });
        }
    }

    handleSample=(e)=>{
        const sampleNumber = parseInt(e.target.name.replace('sample',''),10)
        const sample = e.target.value

        this.handleValidSamples(0)
        if(sample.length <= 11){
            this.updateSamples(sample,sampleNumber - 1)
            this.validateSample(sample,sampleNumber - 1)
        }
    }

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

    handleBlanks=(e)=>{
        const sampleNumber = parseInt(e.target.name.replace('sample',''),10)
        const sample = e.target.value

        this.handleValidSamples(0)
        if(sample === ''){
            this.clearSamples(sampleNumber)
        }
    }

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

    handleTemperature = (event) => {
        if(event.target.value>0) {
            this.setState({
                temperature: event.target.value,
                messageTemp: '',
                validTemp: true,
            });
        } else if(event.target.value==='') {
            this.setState({
                messageTemp: 'El campo no puede estar en blanco',
                validTemp: false,
            });
        } else {
            this.setState({
                messageTemp: 'El valor no puede ser 0',
                validTemp: false,
            });
        }
    }

    handleTime = (event) => {
        if(event.target.value>0) {
            this.setState({
                time: event.target.value,
                messageTime: '',
                validTime: true,
            });
        } else if(event.target.value==='') {
            this.setState({
                messageTime: 'El campo no puede estar en blanco',
                validTime: false,
            });
        } else {
            this.setState({
                messageTime: 'El valor no puede ser 0',
                validTime: false,
            });
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();

        this.setState({
            loading:true
        })

        const operator = this.state.operator
        const time = this.state.time
        const temperature=this.state.temperature
        const samples = this.state.samples.filter((sample)=>{return ((/MU-\d\d-\d\d\d\d\d/.test(sample) && sample.length === 11))})
   
		axios.post(`http://localhost:4000/api/test-forms/add`,{
			operator: operator,
			test: this.state.name,
            samples: samples,
            attributes:[{
                name: 'Temperatura',
                value: temperature
            },
            {
                name: 'Tiempo',
                value: time
            }]
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

    render(){
        const {
            handleSubmit,
            handleOperator,
            handleTemperature,
            handleTime,
            handleSample,
            handleBlanks,
            state: {
                name,
                messageOp,
                validOp,
                messageTemp,
                validTemp,
                messageTime,
                validTime,
                samples,
                messageSamples,
                rightSamples,
                validSamples,
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
            <div className='col-sm-12  col-xl-10'>
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
                        <label className={regularLabels}>Temperatura (C):</label>
                        <input 
                            type='number' 
                            className={inputs}
                            placeholder='###'
                            name='temperature' 
                            onChange={handleTemperature}
                        />
                        <label className={warningLabels}>{messageTemp}</label>
                    </div>
                    <div className='row justify-content-center form-inline mb-3'>
                        <label className={regularLabels}>Tiempo (s):</label>
                        <input type='number' 
                            className={inputs}
                            placeholder='###'
                            name='time' 
                            onChange={handleTime}
                        />
                        <label className={warningLabels}>{messageTime}</label>
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
                                disabled={!rightSamples[0]}
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
                                disabled={!rightSamples[1]}
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
                                disabled={!rightSamples[2]}
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
                                disabled={!rightSamples[3]}
                                onBlur={handleBlanks}
                                onChange={handleSample}
                            />
                            <label className={warningLabels}>{messageSamples[4]}</label> 
                        </div>
                    </div>
					<div className='row justify-content-center'>
                    <label className={'col-lg-3 col-sm-10 text-center col-md-6  mt-3'}><p id='success'>{messageAPI}</p></label>
					</div>
					<div className='row justify-content-center'>
                    <button
                        type='submit'
                        className='btn button col-md-6 col-sm-10 col-lg-3'
                        disabled={(validOp && validTemp && validTime && validSamples) ? false : true}
                        title={(this.state.validSamples && this.state.validOp) ? 'La forma esta lista' : 'La forma no esta lista'}
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
