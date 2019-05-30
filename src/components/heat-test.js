import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import Modal from './modal.js';

export default class HeatTest extends React.Component{
    constructor(props){
        super(props);
        this.state={
            name: 'Prueba de calor',
            operator: '',
            temperature: '',
            messageTemp: '',
            validTemp: undefined,
            time: '',
            messageTime: '',
            validTime: undefined,
            samples: Array(5).fill(''),
            messageSamples: Array(5).fill(''),
            validSamples: undefined,
            messageAPI: '',
            showModal: false,
            loading: false,
        }

        this.handleSample = this.handleSample.bind(this);
        this.handleUpdateSamples = this.handleUpdateSamples.bind(this);
        this.handleSamplesMessage = this.handleSamplesMessage.bind(this);
        this.handleRegex = this.handleRegex.bind(this);
        this.handleRepeatedSamples = this.handleRepeatedSamples.bind(this);
        this.handleSampleStatus = this.handleSampleStatus.bind(this);
        this.handleValidateSamples = this.handleValidateSamples.bind(this);
        this.handleBlanks = this.handleBlanks.bind(this);
        this.handleOnBlur = this.handleOnBlur.bind(this);
        this.handleOperator = this.handleOperator.bind(this);
        this.handleTime = this.handleTime.bind(this);
        this.handleTemperature = this.handleTemperature.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    handleSample(e) {
        const sampleNumber = parseInt(e.target.name.replace('sample',''), 10)
        const sample = e.target.value

        if(sample.length <= 11){
            this.handleUpdateSamples(sample, sampleNumber - 1)
        }
    }


    handleUpdateSamples(value, position) {
        this.setState((state) => {
            let samples = state.samples.map((sample, index) => {
                if(position === index) {
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

    handleSamplesMessage(value, position) {
        this.setState((state) => {
            const messageSamples = state.messageSamples.map((message, index) => {
                if(index === position) {
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

    handleRegex(sample, sampleNumber) {
        if (!(/MU-\d\d-\d\d\d\d\d/.test(sample)) && sample !== '') {
            this.handleSamplesMessage('Incorrect syntax', sampleNumber)
            return false
        } else {
            this.handleSamplesMessage('', sampleNumber)
            return true
        }
    }

    handleRepeatedSamples(sample, sampleNumber, index) {
        if (index <= this.state.samples.length){
            if (sample === this.state.samples[index] && (index !== sampleNumber && index < sampleNumber)){
                this.handleSamplesMessage('Esta muestra esta repetida', sampleNumber)
                return false
            } else {
                this.handleSamplesMessage('', sampleNumber)
                this.handleRepeatedSamples(sample, sampleNumber, index + 1)
                return true
            }
        } else {
            return true
        }
    }

    handleSampleStatus(sample, sampleNumber) {
        if(sample.replace(/\s/g,'') !== ''){
            axios.get(`http://localhost:4000/api/samples/${sample}`)
            .then(res => {
                const state = res.data.estados[res.data.estados.length - 1].estado === 'Muestra lista para prueba de calor' ? true : false

                if (!state) {
                    this.handleSamplesMessage('La muestra no tiene el estado requerido', sampleNumber)
                    this.setState({
                        validSamples: false
                    })
                } else {
                    this.handleSamplesMessage('', sampleNumber)
                    this.setState({
                        validSamples: true
                    })
                    this.handleValidateSamples(sampleNumber + 1)
                }
            })
            .catch( () => {
                this.setState({
                    messageAPI: 'Fallo en la conexion',
                    showModal: true
                });
            });
        } else {
            return 
        }
    }

    handleValidateSamples(sampleNumber) {
        if(sampleNumber <= this.state.samples.length){
            if(this.handleRegex(this.state.samples[sampleNumber], sampleNumber)) {
                const isNotRepeated = this.handleRepeatedSamples(this.state.samples[sampleNumber], sampleNumber, 0)
    
                if(isNotRepeated) {
                    this.handleSampleStatus(this.state.samples[sampleNumber], sampleNumber)
                } else {
                    this.setState({
                        validSamples: false
                    })
                }
            } else {
                this.setState({
                    validSamples: false
                })
            }
        }
    }

    handleBlanks(sampleNumber) {
        if(sampleNumber <= this.state.samples.length) {
            if (sampleNumber < this.state.samples.length - 1) {
                this.handleUpdateSamples(this.state.samples[sampleNumber + 1], sampleNumber)
                this.handleSamplesMessage(this.state.messageSamples[sampleNumber + 1], sampleNumber)
                this.handleBlanks(sampleNumber + 1)
            } else if(sampleNumber === this.state.samples.length - 1){
                this.handleUpdateSamples('', sampleNumber)
                this.handleSamplesMessage('', sampleNumber)
                return
            }
        } else {
            return
        }
    }

    handleOnBlur(e) {
        const sampleNumber = parseInt(e.target.name.replace('sample',''), 10) - 1
        const sample = e.target.value

        if(sample !== '') {
            this.handleValidateSamples(0)
        } else {
            this.handleBlanks(sampleNumber)
        }
    }

    handleTemperature(e) {
        const temp = e.target.value

        if(temp.length <= 3) {
            this.setState({
                temperature: temp,
            });
        }

        if (parseInt(temp) <= 0 ){
            this.setState({
                messageTemp: 'La temperatura no puede ser igual o menor a 0',
                validTemp: false
            })
        } else {
            this.setState({
                messageTemp: '',
                validTemp: true
            })
        }
    }

    handleTime(e) {
        const time = e.target.value

        if(time.length <= 3) {
            this.setState({
                time: time,
            });
        }

        if (parseInt(time) <= 0 ){
            this.setState({
                messageTime: 'El tiempo no puede ser igual o menor a 0',
                validTime: false
            })
        } else {
            this.setState({
                messageTime: '',
                validTime: true
            })
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

    handleSubmit(event) {
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
            }],
            states: ["Prueba de calor pasada", "Muestra lista para prueba de quimica"]
		})

		.then( res=> {
			if (res.data.success === true) {
				this.setState({
                    samples: Array(10).fill(''),
                    rightSamples: Array(10).fill(false),
					messageAPI: res.data.message,
                    validSamples: false,
                    showModal: true,
					loading: false
				})
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
        const handleOnBlur = this.handleOnBlur;
        const handleOnChange = this.handleSample;

        return(<div className='row justify-content-center m-0'>
            <div className='col-12 m-4'>
                <h1 className='text-center'>{this.state.name}</h1>
            </div>
            <div className='col-sm-12  col-xl-10'>
                <form onSubmit={this.handleSubmit}>
                    <div className='row justify-content-center form-inline mb-3'>
                        <label className={regularLabels}>Operador</label>
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
                        <label className={regularLabels}>Temperatura (C):</label>
                        <input 
                            type='number' 
                            value={this.state.temperature}
                            className={inputs}
                            placeholder='###'
                            name='temperature' 
                            onChange={this.handleTemperature}
                        />
                        <label className={warningLabels}>{this.state.messageTemp}</label>
                    </div>
                    <div className='row justify-content-center form-inline mb-3'>
                        <label className={regularLabels}>Tiempo (s):</label>
                        <input
                            type='number'
                            value={this.state.time}
                            className={inputs}
                            placeholder='###'
                            name='time' 
                            onChange={this.handleTime}
                        />
                        <label className={warningLabels}>{this.state.messageTime}</label>
                    </div>
                    <div>
                        <h5 className='text-center m-4'>Códigos</h5>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 1:</label>
                            <input 
                                value={this.state.samples[0]}
                                type='text'
                                className={inputs}
                                name={'sample1'} 
                                placeholder={format}
                                onBlur={handleOnBlur}
								onChange={handleOnChange}
								ref='firstSample'
                            />
							<label className={warningLabels}>{this.state.messageSamples[0]}</label>
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 2:</label>
                            <input
                                value={this.state.samples[1]}
                                disabled={(/MU-\d\d-\d\d\d\d\d/.test(this.state.samples[0]))? false : true}
                                type='text'
                                className={inputs}
                                name={'sample2'}
                                placeholder={format}
                                onBlur={handleOnBlur}
                                onChange={handleOnChange}
                            />
                            <label className={warningLabels}>{this.state.messageSamples[1]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 3:</label>
                            <input 
                                type='text'
                                disabled={(/MU-\d\d-\d\d\d\d\d/.test(this.state.samples[1]))? false : true}
                                value={this.state.samples[2]}
                                className={inputs}
                                name={'sample3'} 
                                placeholder={format}
                                onBlur={handleOnBlur}
                                onChange={handleOnChange}
                            />
                            <label className={warningLabels}>{this.state.messageSamples[2]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 4:</label>
                            <input 
                                type='text'
                                disabled={(/MU-\d\d-\d\d\d\d\d/.test(this.state.samples[2]))? false : true}
                                value={this.state.samples[3]}
                                className={inputs}
                                name={'sample4'} 
                                placeholder={format}
                                onBlur={handleOnBlur}
                                onChange={handleOnChange}
                            />
                            <label className={warningLabels}>{this.state.messageSamples[3]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 5:</label>
                            <input 
                                type='text'
                                disabled={(/MU-\d\d-\d\d\d\d\d/.test(this.state.samples[3]))? false : true}
                                value={this.state.samples[4]}
                                className={inputs}
                                name={'sample5'} 
                                placeholder={format}
                                onBlur={handleOnBlur}
                                onChange={handleOnChange}
                            />
                            <label className={warningLabels}>{this.state.messageSamples[4]}</label> 
                        </div>
                    </div>
					<div className='row justify-content-center'>
                        <button
                            type='submit'
                            className='btn button col-md-6 col-sm-10 col-lg-3'
                            disabled={(/\d{5}/g.test(this.state.operator) && this.state.validTemp && this.state.validTime && this.state.validSamples) ? false : true}
                            title={(/\d{5}/g.test(this.state.operator) && this.state.validTemp && this.state.validTime && this.state.validSamples) ? 'La forma esta lista' : 'La forma no esta lista'}
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
