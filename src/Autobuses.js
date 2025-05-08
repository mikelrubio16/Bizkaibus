import React, { useState, useEffect, useMemo, useRef } from 'react'
import L from "leaflet";
import "leaflet-gpx";
import "leaflet/dist/leaflet.css";


export const Autobuses = () => {

    const [ mostrarBuses2, setMostrarBuses2 ] = useState({});
    const [ gpxLayer, setGPXLayer ] = useState();
    const mapRef = useRef(null); // Almacena la referencia al mapa
    const [ map, setMap ] = useState();
    const [ gpxData, setGPXData ] = useState();
    const [ busMarkers, setBusMarkers ] = useState([]);
    const [selectedLinea, setSelectedLinea] = useState("A3527I");
    const [selectedStop, setSelectedStop] = useState(null);
    const [ trackPoints, setTrackPoints ] = useState([]);

     // Declara las variables de estado para los marcadores
    const [startMarkerLayer, setStartMarkerLayer] = useState(null);
    const [endMarkerLayer, setEndMarkerLayer] = useState(null);

    const startIcon = useMemo(() => new L.Icon({ iconUrl: "./startFlag.png", iconSize: [32, 32] }), []);
    const endIcon = useMemo(() => new L.Icon({ iconUrl: "./endFlag.png", iconSize: [32, 32] }), []);

    // Inicializar el mapa en un useEffect separado
    useEffect(() => {
        // Verifica si el mapa ya está inicializado
        if (mapRef.current !== null && mapRef.current !== undefined) {
            mapRef.current.remove(); // Elimina el mapa anterior antes de crear uno nuevo
        } 

        const mapInstance = L.map("map").setView([43.339729874493635, -2.84893739978817], 10); // Coordenadas iniciales
        setMap(mapInstance); // Guardar la referencia al mapa
        mapRef.current = map; // Guarda la referencia al mapa

        // Añadir la capa base
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
        }).addTo(mapInstance);

        // Cleanup para destruir el mapa si es necesario (cuando el componente se desmonta)
        return () => {
        mapInstance.remove();
        };
    }, [startIcon, endIcon]);

     // Usamos useEffect para llamar a getBuses cuando selectedStop cambia
    useEffect(() => {
        if (selectedStop) {
            getBuses(); // Llama a getBuses solo cuando selectedStop se actualice
        }
    }, [selectedStop]); // Dependencia de selectedStop

    const handleLineaChange = (event) => {
        setSelectedLinea(event.target.value);
        setSelectedStop(null); // Reset seleccion de parada al cambiar la línea
    };
    
    const handleStopChange = (event) => {
        const stopId = event.target.value;
        const stop = lineas[selectedLinea].find((stop) => stop.id.toString() === stopId);
        setSelectedStop(stop); // Guarda la parada completa        
    };

    const lineas = {
        A3527I: [ //Bilbao-Bermeo autopista
            { id: 806, name: "Deustuko Unibertsitatea", lat: 43.271045297221555, lng: -2.9412451962293837 },
            { id: 3394, name: "Atxuri", lat: 43.3582827709362, lng: -2.8547008870006025 },
            { id: 3395, name: "Lauaxeta", lat: 43.35681642985775, lng: -2.850547158110375 },
            { id: 2001, name: "Trobika", lat: 43.35432475527525, lng: -2.846263374765127 },
            { id: 3435, name: "Goietako plaza", lat: 43.35430570210384, lng: -2.8431694960561513 },
            { id: 2080, name: "Trobika auzoa", lat: 43.358786603170145, lng: -2.8352895100381685 },
            { id: 2081, name: "Elordui", lat: 43.36675385436272, lng: -2.8235371555235513 },
            { id: 2082, name: "Larrauri", lat: 43.36732, lng: -2.81051 },
            { id: 2251, name: "Bidebieta", lat: 43.37287, lng: -2.80191 },        
            { id: 2252, name: "Emerando", lat: 43.38052, lng: -2.79034 },
            { id: 2253, name: "Emerando Gane", lat: 43.38504, lng: -2.77797 },
            { id: 2254, name: "Landane. Mañu", lat: 43.38828, lng: -2.77114 },
            { id: 2255, name: "Arrizurieta Mañu", lat: 43.39325, lng: -2.77058 },
            { id: 2256, name: "Elizalde Mañu", lat: 43.39940, lng: -2.75881 },
            { id: 2257, name: "Ganekolanda Mañu", lat: 43.40505, lng: -2.76034 },
            { id: 2258, name: "Itubizkar San Miguel", lat: 43.41300, lng: -2.75345 },
            { id: 2259, name: "Iturrandiaga San Miguel", lat: 43.41692, lng: -2.74925 },
            { id: 2261, name: "Udal Azoka", lat: 43.41964, lng: -2.72796 }
          ],
        A3527V : [ //Bermeo-Bilbao autopista
            { id: 1976, name: "Lamera", lat: 43.41899584832548, lng: -2.7224527508367617},
            { id: 2261, name: "Udal azoka", lat: 43.4196983488353, lng: -2.7279739853320786 },
            { id: 2175, name: "Ametzaga", lat: 43.41986390689414, lng: -2.736919262573285 },
            { id: 2176, name: "Iturrandiaga San Miguel", lat: 43.41708001555424, lng: -2.7491719755353716 },
            { id: 2177, name: "Itubizkar. San Miguel", lat: 43.412219584298136, lng: -2.754298810498985 },
            { id: 2178, name: "Ganekolanda Mañu", lat: 43.405031698251406, lng: -2.7605348257426963 },
            { id: 2179, name: "Elizalde Mañu", lat: 43.399462908557, lng: -2.759002926767856 },
            { id: 2180, name: "Arrizurieta Mañu", lat: 43.393459478187324, lng: -2.770804624505833 },
            { id: 2181, name: "Landane Mañu", lat: 43.38828472261249, lng: -2.7712918772162434 },
            { id: 2182, name: "Emerando Gane", lat: 43.38454436621202, lng: -2.7768233079910893 },
            { id: 2183, name: "Emerando", lat: 43.380422989958014, lng: -2.790800864446651 },
            { id: 2184, name: "Bidebieta", lat: 43.37296292363398, lng: -2.8020943411042123 },
            { id: 2103, name: "Larrauri", lat: 43.367087670787434, lng: -2.8111807325529212 },
            { id: 2081, name: "Elordui", lat: 43.366730405181215, lng: -2.823556479442899 },
            { id: 2105, name: "Trobika auzoa", lat: 43.35684685143182, lng: -2.8382895118223086 },
            { id: 3437, name: "Herri bide 11", lat: 43.3550481811355, lng: -2.8435525224532525 },
            { id: 3438, name: "INEM", lat: 43.35532508752503, lng: -2.846700466600541 },
            { id: 3396, name: "Lauaxeta", lat: 43.356918369977926, lng: -2.8504268521057607 },
            { id: 3397, name: "Atxuri", lat: 43.35807428544508, lng: -2.85788838382915 },
            { id: 128, name: "Deustuko Unibertsitatea", lat: 43.27092054218305, lng: -2.9415939670393443 },
            { id: 168, name: "Museo Plaza", lat: 43.26609224606626, lng: -2.937432872851829 }
        ],
        A3518I : [ //Bilbao-Bakio autopista
            { id: 806, name: "Deustuko Unibertsitatea", lat: 43.271045297221555, lng: -2.9412451962293837 },
            { id: 3394, name: "Atxuri", lat: 43.3582827709362, lng: -2.8547008870006025 },
            { id: 3395, name: "Lauaxeta", lat: 43.35681642985775, lng: -2.850547158110375 },
            { id: 2001, name: "Trobika", lat: 43.35432475527525, lng: -2.846263374765127 },
            { id: 3435, name: "Goietako plaza", lat: 43.35430570210384, lng: -2.8431694960561513 },
            { id: 2080, name: "Trobika auzoa", lat: 43.358786603170145, lng: -2.8352895100381685 },
            { id: 2081, name: "Elordui", lat: 43.36675385436272, lng: -2.8235371555235513 },
            { id: 2082, name: "Larrauri", lat: 43.36732, lng: -2.81051 },
            { id: 2251, name: "Bidebieta", lat: 43.37287, lng: -2.80191 },
            { id: 2084, name: "Ereñotzaga", lat: 43.38036, lng: -2.80122 },
            { id: 2085, name: "Landabarrena", lat: 43.38905, lng: -2.79931 },
            { id: 2086, name: "Goikolea", lat: 43.40403, lng: -2.81088 },
            { id: 2088, name: "Otsategi", lat: 43.41333, lng: -2.81368},
            { id: 2089, name: "Egia-Frontoia", lat: 43.41812, lng: -2.81333},
            { id: 2090, name: "Estankoalde (Romana)", lat: 43.42248, lng: -2.81397 },
            { id: 2091, name: "Olaskoetxe (Irubide)", lat: 43.42712, lng: -2.81160 },
            { id: 2092, name: "Bentalde", lat: 43.42918, lng: -2.80503 },
            { id: 2352, name: "San Pelaio (Begiratokia/Mirador", lat: 43.43155, lng: -2.800145 }
        ],
        A3518V : [ //Bakio-BIlbao autopista
            { id: 2184, name: "Bidebieta", lat: 43.37296292363398, lng: -2.8020943411042123 },
            { id: 2103, name: "Larrauri", lat: 43.367087670787434, lng: -2.8111807325529212 },
            { id: 2081, name: "Elordui", lat: 43.366730405181215, lng: -2.823556479442899 },
            { id: 2105, name: "Trobika auzoa", lat: 43.35684685143182, lng: -2.8382895118223086 },
            { id: 3437, name: "Herri bide 11", lat: 43.3550481811355, lng: -2.8435525224532525 },
            { id: 3438, name: "INEM", lat: 43.35532508752503, lng: -2.846700466600541 },
            { id: 3396, name: "Lauaxeta", lat: 43.356918369977926, lng: -2.8504268521057607 },
            { id: 3397, name: "Atxuri", lat: 43.35807428544508, lng: -2.85788838382915 },
            { id: 128, name: "Deustuko Unibertsitatea", lat: 43.27092054218305, lng: -2.9415939670393443 },
            { id: 168, name: "Museo Plaza", lat: 43.26609224606626, lng: -2.937432872851829 }
        ]
    };

    function findClosestPointIndex(trackPointsParam, stop) {
        let closestIndex = 0;
        let minDistance = Infinity;
        
        trackPointsParam.forEach((point, index) => {
            const distance = haversineDistance(point, stop);
            if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
            }
        });
        
        return closestIndex;
    }

    function haversineDistance(coord1, coord2) {
        const R = 6371e3; // Radio de la Tierra en metros
        const lat1 = coord1.lat * (Math.PI / 180);
        const lat2 = coord2.lat * (Math.PI / 180);
        const deltaLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
        const deltaLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
      
        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
        return R * c; // Devuelve la distancia en metros
    }

    function getRouteSegment(trackPointsParam, stop) {
        const stopIndex = findClosestPointIndex(trackPointsParam, stop);
        return trackPointsParam.slice(stopIndex, trackPointsParam.length-1); // Corta la ruta hasta la parada
    }

    // Usar useEffect para cargar el track y manejar la inversión del track si es necesario
    useEffect(() => {        
        loadGPX(selectedLinea); // Cargar GPX cada vez que cambia la línea              

    }, [selectedLinea]);
    
    // Función para cargar el GPX
    const loadGPX = (linea) => {
        // Este es un ejemplo de cómo cargar el GPX dependiendo de la línea
        ;
        fetch(`/ruta-` + linea.substring(0, linea.length -1) + `.gpx`)
        .then((response) => response.text())
        .then((gpx) => {
            setGPXData(gpx);
        })
        .catch((error) => console.error("Error loading GPX file:", error));
    };

    useEffect(() => {
        if (gpxData && map) {
            const aux = new L.GPX(gpxData, { async: true }).on("loaded", function (e) {
                const track = e.target.getLayers()[0]._layers[e.target.getLayers()[0]._leaflet_id - 1]._latlngs;
                var finalTrack = track;
                if (selectedLinea.endsWith('I')) {
                    // Si la línea seleccionada es la de IDA (A3527I), invertir el track
                    finalTrack = track.reverse();
                }
                setTrackPoints(finalTrack);
                //Recorrer los busMarkers (parada y posicion bus) y eliminarlos del mapa               
                const layersToRemove = Object.values(busMarkers);
                layersToRemove.forEach(marcadores => {
                    map.removeLayer(marcadores);
                });
                setBusMarkers([]);
                
                // --- Lógica para manejar los marcadores de inicio y fin ---
                // 1. Eliminar marcadores anteriores si existen
                if (startMarkerLayer) { // Asumiendo que startMarkerLayer es tu variable de estado
                    map.removeLayer(startMarkerLayer);
                }
                if (endMarkerLayer) { // Asumie ndo que endMarkerLayer es tu variable de estado
                    map.removeLayer(endMarkerLayer);
                }

                // 2. Calcular puntos de inicio y fin del track actual
                // Asegúrate de que 'track' no esté vacío
                if (track && track.length > 0) {
                    const endPoint = finalTrack[0];
                    const startPoint = finalTrack[finalTrack.length - 1];

                    // 3. Crear y añadir los nuevos marcadores
                    // Asegúrate de usar los iconos correctos (startIcon, endIcon)
                    const newStartMarker = L.marker(startPoint, { icon: startIcon }).addTo(map);
                    const newEndMarker = L.marker(endPoint, { icon: endIcon }).addTo(map);

                    // 4. Actualizar las variables de estado con los nuevos marcadores
                    setStartMarkerLayer(newStartMarker);
                    setEndMarkerLayer(newEndMarker);
                } else {
                    // Si el track está vacío, asegúrate de que las variables de estado
                    // para los marcadores también se reinicien a null/undefined
                    setStartMarkerLayer(null);
                    setEndMarkerLayer(null);
                }
                // --- Fin de la lógica de marcadores ---


                // Añadir el GPX al mapa después de que haya sido cargado
                aux.addTo(map);                            
            });
            if (gpxLayer) {
                // Si existe, elimínala del mapa
                map.removeLayer(gpxLayer);
            }
            setGPXLayer(aux);
        }
      }, [gpxData, selectedLinea, map]); // Ejecutar este efecto cuando cambien gpxData o selectedLinea

    const getBuses = () => {        
        // Obtener el valor seleccionado del combobox
        const paradaSeleccionada = document.getElementById('paradas').value;

        //Recibir datos de la parada seleccionada para mostrar los tiempos.
        try {
            fetch("https://apli.bizkaia.net/apps/danok/TQWS/TQ.ASMX/GetPasoParadaMobile_JSON?callback=pruebaBizkaiBus&strLinea=*&strParada=" + paradaSeleccionada)
            .then((response) => response.text()) // Obtener la respuesta como texto
            .then((respuestaBus) => {                
                llamada(respuestaBus);
            })            
            
        } catch (error){
            console.log(error.message)
        }
    }
    
    const removerCallBack = (respuesta) => {
        // Remover el callback para quedarte con el JSON
        const inicio = respuesta.indexOf('({') + 1;
        const fin = respuesta.lastIndexOf('});');
        const respuestaSinCallBack = respuesta.replace(/'/g, '"').substring(inicio, fin + 1);

        return respuestaSinCallBack;
    }

    const llamada = (respuestaBus) => {        
        const jsonData = removerCallBack(respuestaBus);
        // Convertir a objeto JSON
        const data = JSON.parse(jsonData);

        // Parsear el XML del campo Resultado
        if(data.STATUS === "OK")
        {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.Resultado, "text/xml");
        
            // Extraer información de los pasos
            const pasos = xmlDoc.querySelectorAll("PasoParada");
            
            const buses = [];
            const busesArray = [];
            pasos.forEach((paso, index) => {
                const linea = paso.querySelector("linea").textContent;
                const ruta = paso.querySelector("ruta").textContent;
                const minutosPrimerVehiculo = paso.querySelector("e1 > minutos")?.textContent || "N/A";
                const minutosSegundoVehiculo = paso.querySelector("e2 > minutos")?.textContent || "N/A";  
                const metrosPrimerVehiculo = paso.querySelector("e1 > metros")?.textContent || "N/A";               
                const metrosSegundoVehiculo = paso.querySelector("ee > metros")?.textContent || "N/A";
                
                buses.push(`Línea: ${linea}, Ruta: ${ruta}, Minutos: ${minutosPrimerVehiculo}, Metros: ${metrosPrimerVehiculo} Minutos: ${minutosSegundoVehiculo}, Metros: ${metrosSegundoVehiculo}`);
                const bus = {
                    linea: linea,
                    ruta: ruta,
                    minutosPrimerVehiculo: minutosPrimerVehiculo,
                    minutosSegundoVehiculo: minutosSegundoVehiculo,
                    metrosPrimerVehiculo: metrosPrimerVehiculo,
                    metrosSegundoVehiculo: metrosSegundoVehiculo
                };
                if(linea === selectedLinea.substring(0, selectedLinea.length-1)) 
                    busesArray.push(bus);
            });
            setMostrarBuses2(busesArray);

            busesArray.forEach((bus) => {
                updateBusPosition(bus.metrosPrimerVehiculo, 'red', bus.linea, selectedStop);
            });

            if(busesArray.length === 1)
            {
                updateBusPosition(busesArray[0].metrosPrimerVehiculo, 'red', busesArray[0].linea, selectedStop);
                if(busesArray[0].metrosSegundoVehiculo !== "N/A")
                    updateBusPosition(busesArray[0].metrosSegundoVehiculo, 'yellow', busesArray[0].linea, selectedStop);
            }
            else if(busesArray.length === 2)
            {
                updateBusPosition(busesArray[0].metrosPrimerVehiculo, 'red', busesArray[0].linea, selectedStop);
                updateBusPosition(busesArray[1].metrosPrimerVehiculo, 'yellow', busesArray[1].linea, selectedStop);
            }
            else if(busesArray.length === 3)
            {
                updateBusPosition(busesArray[0].metrosPrimerVehiculo, 'red', busesArray[0].linea, selectedStop);
                updateBusPosition(busesArray[1].metrosPrimerVehiculo, 'yellow', busesArray[1].linea, selectedStop);
                updateBusPosition(busesArray[2].metrosPrimerVehiculo, 'green', busesArray[2].linea, selectedStop);
            }
            updateBusPosition(0, 'black', "Parada", selectedStop);
            
            //updateBusPosition(300, 'red', "A3527", selectedStop);

            const rows = document.querySelectorAll("#tabla tr");
            rows.forEach((row) => row.classList.add('updated'));

            setTimeout(() => {
                rows.forEach((row) => row.classList.remove('updated'));
            }, 500);
        }
        else
        {
            console.log(data.STATUS); // "OK"
            console.log(data.Resultado); // Contenido en XML
        }        
    };
    
    // Función para calcular la posición del autobús en la ruta
    function getPositionOnRoute(trackPointsParam, distanceRemaining) {
        let totalDistance = 0;  
        if(trackPointsParam.length > 0)
        {
            for (let i = 0; i < trackPointsParam.length - 1; i++) {
                const segmentDistance = map.distance(trackPointsParam[i], trackPointsParam[i + 1]);
                totalDistance += segmentDistance;
        
                if (totalDistance >= distanceRemaining) {
                return trackPointsParam[i];
                }
            }        
            return trackPointsParam[trackPointsParam.length - 1]; // Devuelve el último punto si se recorre toda la distancia
        }        
    }         

    function updateBusPosition(metros, color, busId, selectedStop) {
        if (!map) return;    

        const latLangs = gpxLayer.getLayers()[0]._layers[gpxLayer.getLayers()[0]._leaflet_id - 1]._latlngs;
        const routeSegment = getRouteSegment(latLangs, selectedStop);
        //L.marker([routeSegment[routeSegment.length -1].lat, routeSegment[routeSegment.length -1].lng], {icon: endIcon}).addTo(map);
        //downloadGPX(routeSegment);
        const position = getPositionOnRoute(routeSegment, metros); // Usar la ruta recortada
      
        if (!position) {
          console.error("No se pudo calcular la posición para el autobús:", busId);
          return;
        }
      
        if (busMarkers[busId]) { //Si existe el punto del bus solicitado actualizo su posicion
          busMarkers[busId].setLatLng(position);
        } else { //Si no existe el punto del bus lo creo y lo dibujo en el mapa
          const marker  = L.circleMarker(position, {
            radius: 8,
            color: color,
            fillColor: color,
            fillOpacity: 0.8,
          }).addTo(map);
          
          busMarkers[busId] = marker;
          setBusMarkers(busMarkers);
        }
      }
    
  return (
    <div>   
        <div id="map" className="map"></div>     
        <h1>Autobuses</h1>
        <select className="lineas" id="lineas" name="lineas"  onChange={handleLineaChange}>
            <option value="A3527I">A3527 Bilbao-Bermeo</option>
            <option value="A3527V">A3527 Bermeo-Bilbao</option>
            <option value="A3518I">A3518 Bilbao-Bakio</option>
            <option value="A3518V">A3518 Bakio-Bilbao</option>
        </select>
        <br />
        <br />
        <select className="paradas" id="paradas" name="paradas" onChange={handleStopChange} value={selectedStop ? selectedStop.id : ""}>
            <option value="">Selecciona una parada</option>
            {lineas[selectedLinea].map((stop) => (
                <option key={stop.id} value={stop.id}>
                    {stop.name} {stop.id}
                </option>
            ))}
        </select>

        <br />
        <br />
        <button className='boton' type="submit" onClick={ getBuses }>Consultar buses</button>

        <h2>{document.getElementById('paradas')?.options[document.getElementById('paradas').selectedIndex].text}</h2> 
        <table className='tabla' id="tabla">
            <thead>
                <tr>
                    <th className="titulo">Linea</th>
                    <th className="titulo">Jomuga</th>
                    <th className="titulo">Min</th>
                    <th className="titulo">Metros</th>
                    <th className="titulo">Min</th>
                    <th className="titulo">Metros</th>
                </tr>
            </thead>
            <tbody>
        
            {mostrarBuses2.length >= 1 ? 
                    (
                        
                        mostrarBuses2.map((bus, indice) => {
                            return <tr key={indice + indice} id={"datos" + indice}>
                            
                                <td key={indice + "0"} className='datos'>{bus.linea}</td>
                                <td key={indice + "1"} className='datos'>{bus.ruta}</td>
                                <td key={indice + "2"} className='datos'>{bus.minutosPrimerVehiculo}</td>
                                <td key={indice + "3"} className='datos'>{bus.metrosPrimerVehiculo}</td>
                                <td key={indice + "4"} className='datos'>{bus.minutosSegundoVehiculo}</td>
                                <td key={indice + "5"} className='datos'>{bus.metrosSegundoVehiculo}</td>
                            
                            </tr>                                                                    
                        })                        
                    )
                : (<tr><td colSpan={6}>No hay buses para mostrar</td></tr>)
                }
            </tbody>
        </table>
    </div>
    )
}
