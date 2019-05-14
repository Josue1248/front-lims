import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

export default class ElectricityTest extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            name: 'Prueba de electricidad',
            operator: 0,
            messageOp: '',
            validOp: undefined,
            samples: Array(10).fill(''),
            messageSamples: Array(10).fill(''),
            validSamples: false,
            messageAPI: '',
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
        this.handleSubmit = this.handleSubmit.bind(this);
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

    handleSample(e) {
        const sampleNumber = parseInt(e.target.name.replace('sample',''), 10)
        const sample = e.target.value

        if(sample.length <= 11){
            this.handleUpdateSamples(sample, sampleNumber - 1)
        }
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

    handleSampleStatus(sample, sampleNumber) {
            axios.get(`http://localhost:4000/api/samples/${sample}`)
            .then(res => {
                if (res.data.estado !== 'Nueva muestra' || res.data.message === 'Muestra usada') {
                    this.handleSamplesMessage('La muestra no es nueva', sampleNumber)
                    this.setState({
                        validSamples: false
                    })
                } else {
                    this.handleSamplesMessage('', sampleNumber)
                    this.setState({
                        validSamples: true
                    })
                }
            })
            .catch( () => {
                alert('Conection Timed Out');
            });
    }

    handleValidateSamples(sample, sampleNumber) {
        if(this.handleRegex(sample, sampleNumber)){
            const isNotRepeated = this.handleRepeatedSamples(sample, sampleNumber, 0)

            if(isNotRepeated){
                this.handleSampleStatus(sample, sampleNumber)
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

    handleOnBlur(e) {
        const sampleNumber = parseInt(e.target.name.replace('sample',''), 10) - 1
        const sample = e.target.value

        if(sample !== '') {
            this.handleValidateSamples(sample, sampleNumber)
        } else {
            this.handleBlanks(sampleNumber)
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

    handleBlanks(sampleNumber) {
        if(sampleNumber <= this.state.samples.length) {
            this.handleUpdateSamples(this.state.samples[sampleNumber + 1], sampleNumber )
            this.handleSamplesMessage(this.state.messageSamples[sampleNumber + 1], sampleNumber)
            this.handleBlanks(sampleNumber + 1)
        } else {
            return
        }
    }

    handleOperator(e) {
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

    handleSubmit(event) {
        event.preventDefault();

        this.setState({
            loading:true
        })

        const operator = this.state.operator

        const samples = this.state.samples.filter((sample)=>{return ((/SA-\d\d-\d\d\d\d\d/.test(sample) && sample.length === 11))})
   
		axios.post(`http://localhost:4000/api/test-forms/add`,{
			operator: operator,
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

    render(){
        const format = 'MU-##-#####'
        const regularLabels = 'col-md-12 col-sm-12 col-lg-2 col-xl-2 d-block'
        const inputs = 'col-md-12 col-sm-12 col-lg-5 col-xl-5 form-control'
        const warningLabels = 'col-md-12 col-sm-12 col-lg-10 col-xl-10 text-danger text-center'
        const handleOnBlur = this.handleOnBlur;
        const handleOnChange = this.handleSample;

        let operatorInput = inputs

        if(this.state.validOp === false) {
            operatorInput = operatorInput += ' border-danger'
        } else if(this.state.validOp === true) {
            operatorInput = operatorInput += ' border-success'
        } else {
            operatorInput = inputs
        }

        return(<div className='row justify-content-center m-0'>
            <div className='col-12 m-4'>
                <h1 className='text-center'>{this.state.name}</h1>
            </div>
            <div className='col-sm-12 col-xl-10'>
                <form onSubmit={this.state.handleSubmit}>
                    <div className='row justify-content-center form-inline mb-3'>
                        <label className={regularLabels}>Operador</label>
                        <input
                            type='text'
                            className={operatorInput}
                            name='operator' 
                            placeholder='#####'
                            onBlur={this.handleOperator}
                        />
                        <label className={warningLabels}>{this.state.messageOp}</label>
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
                                value={this.state.samples[4]}
                                className={inputs}
                                name={'sample5'} 
                                placeholder={format}
                                onBlur={handleOnBlur}
                                onChange={handleOnChange}
                            />
                            <label className={warningLabels}>{this.state.messageSamples[4]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 6:</label>
                            <input 
                                type='text'
                                value={this.state.samples[5]}
                                className={inputs}
                                name={'sample6'} 
                                placeholder={format}
                                onBlur={handleOnBlur}
                                onChange={handleOnChange}
                            />
                            <label className={warningLabels}>{this.state.messageSamples[5]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 7:</label>
                            <input 
                                type='text'
                                value={this.state.samples[6]}
                                className={inputs}
                                name={'sample7'} 
                                placeholder={format}
                                onBlur={handleOnBlur}
                                onChange={handleOnChange}
                            />
                            <label className={warningLabels}>{this.state.messageSamples[6]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 8:</label>
                            <input 
                                type='text'
                                value={this.state.samples[7]}
                                className={inputs}
                                name={'sample8'} 
                                placeholder={format}
                                onBlur={handleOnBlur}
                                onChange={handleOnChange}
                            />
                            <label className={warningLabels}>{this.state.messageSamples[7]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 9:</label>
                            <input 
                                type='text'
                                value={this.state.samples[8]}
                                className={inputs}
                                name={'sample9'} 
                                placeholder={format}
                                onBlur={handleOnBlur}
                                onChange={handleOnChange}
                            />
                            <label className={warningLabels}>{this.state.messageSamples[8]}</label> 
                        </div>
                        <div className='row justify-content-center form-inline mb-2'>
                            <label className={regularLabels}>Muestra 10:</label>
                            <input 
                                type='text'
                                value={this.state.samples[9]}
                                className={inputs}
                                name={'sample10'}
                                placeholder={format}
                                onBlur={handleOnBlur}
                                onChange={handleOnChange}
                            />
                            <label className={warningLabels}>{this.state.messageSamples[9]}</label>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
					<button
                        type='submit'
                        className='btn button col-md-6 col-sm-10 col-lg-3'
                        disabled={(this.state.validSamples && this.state.validOp) ? false : true}
                        title={(this.state.validSamples && this.state.validOp) ? 'La forma esta lista' : 'La forma no esta lista'}
                    >
                    Guardar
                    {(this.state.loading) ? <img src='/images/spinner.gif' alt='loading' id='spinner'/> : ''}
                    </button>
					</div>
					<div className='row justify-content-center'>
					<label id='success' className={'col-lg-3 col-sm-10 text-center col-md-6  mt-3'}>
                    {this.state.messageAPI}
                    </label>
					</div>
                </form>
            </div>
        </div>)
    }
}