import React, { useState, useEffect } from 'react'
import L from "leaflet";
import "leaflet-gpx";
import "leaflet/dist/leaflet.css";

export const Prueba = () => {

    const [ mostrarBuses2, setMostrarBuses2 ] = useState({});
    const [ gpxLayer, setGPXLayer ] = useState();
    const [ trackPoints, setTrackPoints ] = useState([]);
    const [ map, setMap ] = useState();
    const [ busMarkers, setBusMarkers ] = useState([]);

    useEffect(() => {
            // Inicializa el mapa
            const map = L.map("map").setView([40.4168, -3.7038], 13); // Coordenadas iniciales
            setMap(map);
            const endIcon = L.icon({
                iconUrl: "/endFlag.png", // O usa `endFlagIcon` si lo importaste
                iconSize: [32, 32], // Ajusta según el tamaño que prefieras
                iconAnchor: [16, 32], // El punto del icono que se posicionará en el mapa
                popupAnchor: [0, -32], // Opcional: ajuste de popups
              });

            const startIcon = L.icon({
            iconUrl: "/startFlag.png", // O usa `endFlagIcon` si lo importaste
            iconSize: [32, 32], // Ajusta según el tamaño que prefieras
            iconAnchor: [16, 32], // El punto del icono que se posicionará en el mapa
            popupAnchor: [0, -32], // Opcional: ajuste de popups
            }); 

            // Añade una capa base
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
            }).addTo(map);

            // Carga el archivo GPX
            //let gpxLayer;
            fetch("/ruta-autobus2.gpx")
            .then((response) => {
                if (!response.ok) {
                throw new Error("Error al cargar el archivo GPX");
                }
                return response.text();
            })
            .then((gpxData) => {
                let aux = new L.GPX(gpxData, { async: true})
                .on("loaded", function (e) {
                    //console.log("GPX cargado correctamente");
                    map.fitBounds(e.target.getBounds()); // Ajusta el mapa al track
                    let auxTrackPoints = aux.getLayers()[0]._layers[aux.getLayers()[0]._leaflet_id - 1]._latlngs;  
                    let trackPoints = auxTrackPoints.reverse();
                    setTrackPoints(trackPoints);
                    if(trackPoints.length > 0)
                        {
                            //console.log("lat: " + trackPoints[0].lat + " long: " + trackPoints[0].lng);
                            L.marker([trackPoints[0].lat, trackPoints[0].lng], {icon: endIcon}).addTo(map);
                            L.marker([trackPoints[trackPoints.length -1].lat, trackPoints[trackPoints.length -1].lng], {icon: startIcon}).addTo(map);
                        }
                })
                .addTo(map);
                setGPXLayer(aux);
            })
            .catch((error) => {
                console.error("Error al cargar el archivo GPX:", error);
            });
        }, []);

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

        //Recibir datos de la parada de Bermeo para saber cuanto le queda al bus para llegar a Bermeo y dibujar el autobus
        try { 
            fetch("https://apli.bizkaia.net/apps/danok/TQWS/TQ.ASMX/GetPasoParadaMobile_JSON?callback=pruebaBizkaiBus&strLinea=*&strParada=" + 1976)
            .then((response) => response.text()) // Obtener la respuesta como texto
            .then((respuestaBus) => {                
                //Captar los datos para actualizar la posicion del bus en el mapa
                const data = JSON.parse(removerCallBack(respuestaBus));
                // Parsear el XML del campo Resultado
                if(data.STATUS === "OK")
                    {
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(data.Resultado, "text/xml");
                
                        // Extraer información de los pasos
                        const pasos = xmlDoc.querySelectorAll("PasoParada");
                        //setPasos(pasos);
                        const buses = [];
                        const busesArray = [];
                        pasos.forEach((paso, index) => {                            
                            const linea = paso.querySelector("linea").textContent;
                            const ruta = paso.querySelector("ruta").textContent;
                            const minutosPrimerVehiculo = paso.querySelector("e1 > minutos")?.textContent || "N/A";
                            const minutosSegundoVehiculo = paso.querySelector("e2 > minutos")?.textContent || "N/A";  
                            const metrosPrimerVehiculo = paso.querySelector("e1 > metros")?.textContent || "N/A";               
                            const metrosSegundoVehiculo = paso.querySelector("ee > metros")?.textContent || "N/A";
                            
                            //buses.push(`Línea: ${linea}, Ruta: ${ruta}, Minutos: ${minutosPrimerVehiculo}, Metros: ${metrosPrimerVehiculo} Minutos: ${minutosSegundoVehiculo}, Metros: ${metrosSegundoVehiculo}`);
                            const bus = {
                                linea: linea,
                                ruta: ruta,
                                minutosPrimerVehiculo: minutosPrimerVehiculo,
                                minutosSegundoVehiculo: minutosSegundoVehiculo,
                                metrosPrimerVehiculo: metrosPrimerVehiculo,
                                metrosSegundoVehiculo: metrosSegundoVehiculo
                            };
                            if(linea === "A3527" || linea === "A3528" || linea === "A3517") //Buses que van a Bermeo
                                busesArray.push(bus);                            
                        });
            
                        //console.log(busesArray);
                        if(busesArray.length === 1)
                        {
                            updateBusPosition(busesArray[0].metrosPrimerVehiculo, 'red', busesArray[0].linea);
                            if(busesArray[0].metrosSegundoVehiculo != "N/A")
                                updateBusPosition(busesArray[0].metrosSegundoVehiculo, 'yellow', busesArray[0].linea);

                        }
            
                        //updateBusPosition2(3000, 'red', busesArray[0].linea);
                        //updateBusPosition2(5000, 'blue', busesArray[1].linea);
                        //updateBusPosition2(16000, 'green', busesArray[2].linea);
            
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
            //console.log(pasos);
            //setPasos(pasos);
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
                busesArray.push(bus);
            });
            setMostrarBuses2(busesArray);
            console.log(busesArray);

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
    function getPositionOnRoute(trackPoints, distanceRemaining) {
        let totalDistance = 0;  
        
        if(trackPoints.length > 0)
        {
        for (let i = 0; i < trackPoints.length - 1; i++) {
            const segmentDistance = map.distance(trackPoints[i], trackPoints[i + 1]);
            totalDistance += segmentDistance;
    
            if (totalDistance >= distanceRemaining) {
            return trackPoints[i];
            }
        }
    
        return trackPoints[trackPoints.length - 1]; // Devuelve el último punto si se recorre toda la distancia
        }        
    }      

    function updateBusPosition(metros, color, busId) {
        
        if (!gpxLayer) {
            //console.error("La capa GPX aún no está cargada.");
            return;
            }
              
            if(trackPoints.length > 0)
            {
                // Calcular la posición del autobús basándote en la distancia
                const position = getPositionOnRoute(trackPoints, metros); // Método que ya tienes definido
            
                if (!position) {
                console.error("No se pudo calcular la posición para el autobús:", busId);
                return;
                }
            
                // Si ya existe un marcador para este autobús, actualízalo
                if (busMarkers[busId]) {
                busMarkers[busId].setLatLng(position); // Mueve el marcador existente
                } else {
                // Si no existe, crea un nuevo marcador
                const marker = L.circleMarker(position, {
                    radius: 8, // Tamaño del marcador
                    color: color, // Usa el color pasado como argumento
                    fillColor: color,
                    fillOpacity: 0.8,
                }).addTo(map);
            
                // Almacena el nuevo marcador
                busMarkers[busId] = marker;
                setBusMarkers(busMarkers);
                }
            }  
      }

  return (
    <div>   
        <div id="map" className="map"></div>     
        <h1>Autobuses</h1>
        <select className="paradas" id="paradas" name="paradas">
            <option value="2251">Bidebieta hacia Bermeo/Bakio</option>
            <option value="2184">Bidebieta hacia Mungia</option>
            <option value="3395">Herriko hacia Bermeo/Bakio</option>
            <option value="2001">M Mungia</option>
        </select>
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
