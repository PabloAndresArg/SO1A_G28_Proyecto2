import { Component } from "react";
import {
    ZoomableGroup,
    ComposableMap,
    Geographies,
    Geography
} from "react-simple-maps";
import Swal from 'sweetalert2'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Bounce, Zoom } from "react-awesome-reveal";
import axios from "axios";
import Select from "@material-ui/core/Select";
import Grid from '@material-ui/core/Grid';
/*



                            PARA REDIS



*/


export default class Rep4 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            geoUrl: "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json",
            country_name: 'Guatemala',
            tituloReporte: 'Personas Vacunadas en ',
            titulos: ['name', 'location', 'gender', 'age', 'vaccine_type'],
            consulta: [], // no se envia sino que se hace la peticion desde aca: :v
            urlRedis: 'https://us-central1-deft-set-312418.cloudfunctions.net/rep-pais-vacunados',
            paises: []
        }
    }

    async componentDidMount() {
        // constructor
        this.llenarPaises();
        this.getConsulta(); 
        this.hilo = setInterval(() => { this.getConsulta(); }, 3500);
        await this.setState({ tituloReporte:  'Personas Vacunadas en '+this.state.country_name})
    }
    async llenarPaises(){
        const res = await axios.get('https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json');
        console.log("GEOGRAFIA", res.data.objects.ne_110m_admin_0_countries.geometries)
        let paises_api = res.data.objects.ne_110m_admin_0_countries.geometries;
        let paises_ = [];
        paises_api.forEach(element => {
            paises_.push(element.properties.NAME_LONG);
        });
        await this.setState({ paises: paises_ })
    }

    ManejadorSearch = async (e) => {
        await this.setState({
            [e.target.name]: e.target.value, // GUARDO EL VALOR DEL INPUT DE ACUERDO A SU NOMBRE
        });
        this.llenarPaises();
    };

    componentWillUnmount() {
        clearInterval(this.hilo);
    }

    async getConsulta() {

        if (this.state.country_name !== undefined){ 
            await axios.get(this.state.urlRedis , {headers : {
                'pais' : this.state.country_name
              }}).then( async (res)=>{

                  if(res.data[this.state.country_name] != undefined  ){
                    await this.setState({ consulta: res.data[this.state.country_name] });
                  }else{
                    await this.setState({consulta: []});
                  }
              }).catch( (err) => { console.log(err); this.setState({consulta: []});  });
        }
    }

    ManejadorSearch = async (e) => {
        await this.setState({
            [e.target.name]: e.target.value, // GUARDO EL VALOR DEL INPUT DE ACUERDO A SU NOMBRE
        });
        // ACA QUE HAGA LA BUSQUEDA
        await this.setState({ tituloReporte:  'Personas Vacunadas en '+this.state.country_name})
        this.getConsulta();
    
    };






    async setCountrySearch(name) {  // POR CADA PAIS
        Swal.fire({
            position: 'top',
            icon: 'success',
            title: name,
            showConfirmButton: false,
            timer: 1500
        })
        await this.setState({ country_name: name })
        await this.getConsulta();
        await this.setState({ tituloReporte:  'Personas Vacunadas en '+this.state.country_name})
     
    }
    render() {
        return (
            <> 

            <Bounce>
            <label className="col-form-label ">
                    Selecciona un Pais
                </label>
            </Bounce>


                <div style={{ width: 800, height: 800, marginBottom: 0 }}>
                    <ComposableMap data-tip="" projectionConfig={{ scale: 200 }}>
                        <ZoomableGroup>
                            <Geographies geography={this.state.geoUrl}>
                                {({ geographies }) =>
                                    geographies.map((geo) => (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            onClick={this.setCountrySearch.bind(this, geo.properties.NAME_LONG)}
                                            onMouseEnter={() => {

                                            }}
                                            onMouseLeave={() => {
                                            }}
                                            style={{
                                                default: {
                                                    fill: "#00283d",
                                                    outline: "none"
                                                },
                                                hover: {
                                                    fill: "#C2FC19",
                                                    outline: "none"
                                                },
                                                pressed: {
                                                    fill: "#E42",
                                                    outline: "none"
                                                }
                                            }}
                                        />
                                    ))
                                }
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>
                </div>






                <Grid container spacing={8}>
                    <Grid item md={12} xs={12} className="offset-2" >
                        <div className="form-group negro" style={{ marginTop: 25, marginLeft: '25%' }}>
                            <label className="col-form-label ">Selecciona un Pais</label>
                            <Select
                                name="country_name"
                                style={{
                                    width: "auto",
                                    minWidth: '46%',
                                    marginTop: 0,
                                    marginLeft: 25,
                                    marginBottom: 15,
                                    background: 'white',

                                }}
                                native
                                value={this.state.country_name}
                                onChange={this.ManejadorSearch.bind(this)}

                            >
                                {
                                    this.state.paises.map((row) => (
                                        <option key={row} value={row} style={{ textAlign: 'center' }}>   {row}   </option>
                                    ))

                                }
                            </Select>
                        </div>
                    </Grid>
                </Grid>

                <div style={{ marginTop: 0}}>

                    <Bounce left>
                        <h2 style={{ textAlign: 'center' }}>{this.state.tituloReporte}</h2>
                    </Bounce>



                    <Zoom>



                        <TableContainer component={Paper} className="my-3" style={{ maxHeight: 481, maxWidth: '100%' }}>
                            <Table style={{ minWidth: 900 }} aria-label="caption table" >
                                <TableHead >

                                    <TableRow >
                                        <TableCell align="center" className="text-black" style={{ fontWeight: 'bolder', textTransform: 'uppercase' }} >{'#'}</TableCell>
                                        {
                                            this.state.titulos.map((row) => (
                                                <TableCell align="center" className="text-black" style={{ fontWeight: 'bolder', textTransform: 'uppercase' }}>{row}</TableCell>
                                            ))
                                        }
                                    </TableRow>

                                </TableHead>
                                <TableBody>
                                    { this.state.consulta.map((row, index) => (
                                        <TableRow key={row.name}>
                                            <TableCell align="center" className="text-black">{index + 1}</TableCell>
                                            {this.state.titulos.map((titulo) => (
                                                <TableCell align="center" className="text-black">{row[titulo]}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Zoom>

                </div>

                <div style={{ height: 400 }}>

                </div>
            </>
        );
    }
}

