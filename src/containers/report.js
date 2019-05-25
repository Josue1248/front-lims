import React from 'react';
import axios from 'axios';

import ResponsiveTable from '../components/ResponsiveTable';
import Modal from '../components/modal.js';


export default class SampleSearch extends React.Component{
    state = {
        sample:'',
        validSample: false,
        sampleSearched: '',
        messageAPI: '',
        showModal: false,
        logs: [],
        attributes: [],
      }

    handleSample = (e) => {
        const sample = e.target.value

        if(sample.length <= 11) {
            this.setState({
                sample: sample,
            })
        }

        if(!(/MU-\d\d-\d\d\d\d\d/.test(sample)) && sample !== '') {
            this.setState({
                messageAPI: 'Error de sintaxix',
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
        .catch( () => {
            this.setState({
                messageAPI: 'Fallo en la conexion',
                showModal: true,
			});
        });
    }
    
    hideModal = () => {
        this.setState({
            showModal: !this.state.showModal 
        });
    };
	
    render() {
        const regularLabels = 'col-md-4 col-sm-12 col-lg-3 col-xl-3 d-block text-right'

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
                        value={this.state.sample}
                        onChange={this.handleSample}
                    />
                    <button
                        className='ml-1 col-md-2 col-sm-12 col-lg-2 col-xl-2 btn button'
                        onClick={this.handleSearch}
                        disabled={!this.state.validSample}
                    >
                    Buscar
                    </button>
                </div>
                <div className='row justify-content-center'>
                    <label className={'col-lg-12 col-sm-12 col-md-12 text-center text-danger mt-3'}><p>{this.state.messageAPI}</p></label>
                </div>
            </div>
            <h3 className='col-12 text-center pb-2'>{this.state.sampleSearched}</h3>
            <div>
				{
					this.state.logs && this.state.logs.length === 0 ? ('') : (
						<ResponsiveTable title='Estados' cols={{
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
						<ResponsiveTable title='Atributos' cols={{
							Atributo: 'Atributo',
							Valor: 'Valor',
                            Unidad: 'Unidad'
						}} rows={this.state.attributes}/>
					)
				}		
            </div>
            <Modal 
                showModal={this.state.showModal}
                handleClose={this.hideModal}
                title={'LIMS'}
                message={this.state.messageAPI}
            />
        </div>)
        }
    }
