import React from 'react';
import axios from 'axios';


import ResponsiveTable from '../components/ResponsiveTable';


export default class SampleSearch extends React.Component{
    state = {
        sample:'',
        validSample: false,
        messageAPI: '',
        sampleSearched: '',
        logs: [],
        attributes: [],
      }

    addSample = (e) => {
        const sample = e.target.value

        this.setState({
            sample: sample,
        })
        if(!(/MU-\d\d-\d\d\d\d\d/.test(sample)) && sample !== '') {
            this.setState({
                messageAPI: 'Error de sintaxix',
                validSample: false,
            })
        } else if(sample === '') {
            this.setState({
                messageAPI: '',
                validSample: false,
            })
        } else {
            this.setState({
                messageAPI: '',
                validSample: true,
            })
        }

    }

    handleSearch = () => {
        const sample = this.state.sample
        
        axios.get(`http:///localhost:4000/api/logs/${sample}`)
        .then(res => {
            if(res.data.message) {
                this.setState({
                    logs: [],
                    attributes: [],
                    sampleSearched: '',
                    messageAPI: res.data.message
                });
            } else {
                const logs = res.data.Logs;
                const attributes = res.data.Attributes;

                this.setState({
                    sampleSearched: this.state.sample,
                    sample: '',
                    logs,
                    attributes,
                    messageAPI: '',
                    validSample: false
                })
            }
        })
        .catch( () => alert('Conection Timed Out'));
	}
	
    render() {
        const {
            addSample,
            validateSample,
            handleSearch,
            state: {
                sample,
                validSample,
                messageAPI,
                sampleSearched,
            }
        } = this;

        const regularLabels = 'col-md-6 col-sm-12 col-lg-3 col-xl-3 d-block text-right'

        
        return(<div className='content'>
                    <div className='row justify-content-center form-inline m-4'>
                       <div className='col-12 row justify-content-center form-inline mb-2'>
                        <label className={regularLabels}>Muestra:</label>
                        <input
                            id='sample'
                            type='text'
                            name='sample'
                            className={'col-md-6 col-sm-12 col-lg-4 col-xl-3 form-control'}
                            placeholder='MU-##-#####'
                            value={sample}
                            onChange={addSample}
                            onBlur={validateSample}
                            />
                       </div>
                <div className='row col-12 justify-content-center form-inline mb-2'>
                    <button
                        className='btn btn-primary col-md-6 col-sm-10 col-lg-3'
                        onClick={handleSearch}
                        disabled={!validSample}
                    >
                    Buscar
                    </button>
                </div>
                <div className='row justify-content-center'>
                    <label className={'col-lg-12 col-sm-12 col-md-12 text-center text-danger mt-3'}><p className='Danger'>{messageAPI}</p></label>
					</div>
            </div>
            <h3 className='col-12 text-center pb-2'>{sampleSearched}</h3>
            <div>
				{
					this.state.logs && this.state.logs.length === 0 ? ('') : (
						<ResponsiveTable title='Sample logs' cols={{
							Operador: 'Operador',
							Muestra: 'Muestra',
							Estado: 'Estado',
							Prueba: 'Prueba',
							Fecha: 'Fecha'
						}} rows={this.state.logs}/>
					)
				}
				{
					this.state.attributes && this.state.attributes.length === 0 ? ('') : (
						<ResponsiveTable title='Sample attributes' cols={{
							Atributo: 'Atributo',
							Valor: 'Valor'
						}} rows={this.state.attributes}/>
					)
				}		
            </div>
        </div>)
        }
    }
