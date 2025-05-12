import React, { useState, useEffect, useMemo, useRef } from 'react'
import L from "leaflet";
import "leaflet-gpx";
import "leaflet/dist/leaflet.css";
import { lineas } from './Bus.js';

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

    const startIcon = useMemo(() => new L.Icon({ iconUrl: "./icons/startFlag.png", iconSize: [32, 32], }), []);
    const endIcon = useMemo(() => new L.Icon({ iconUrl: "./icons/endFlag.png", iconSize: [32, 32] }), []);
    const busIcon = useMemo(() => new L.Icon({ iconUrl: "./icons/busIcon.png", iconSize: [24, 24] }), []);

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
        fetch(`/routes/ruta-` + linea.substring(0, linea.length -1) + `.gpx`)
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
                    // Si la línea seleccionada es la de IDA (termina en I el track), invertir el track
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
          if(color == "black")
            busMarkers[busId].bindPopup(selectedStop.name);
        } else { //Si no existe el punto del bus lo creo y lo dibujo en el mapa        
            var marker;
            if(color == "black")
            {
                marker  = L.circleMarker(position, {
                radius: 8,
                color: color,
                fillColor: color,
                fillOpacity: 0.8,
                }).addTo(map).bindPopup("Parada " + selectedStop.name);;
            }
            else
            {
                marker = L.marker(position, { icon: busIcon }).addTo(map);
            }
          
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
