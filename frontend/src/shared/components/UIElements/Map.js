import React, { useRef, useEffect } from 'react';
import 'ol/ol.css';
import MapOL from 'ol/Map';
import View from 'ol/View';
import Tile from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import './Map.css';
 
const Map = props => {
  const mapRef = useRef();
  
  const { center, zoom } = props;
 
  useEffect(() => {
    const map = new MapOL({
      target: mapRef.current.id,
      layers: [
        new Tile({
          source: new OSM(),
        })
      ],
      view: new View({
        center: [0,0],
        zoom: zoom
      })
    });
    return () =>
    {
        map.dispose();
    }
  }, []);
 
  return (
    <div
      ref={mapRef}
      className={`map ${props.className}`}
      style={props.style}
      id="map"
    ></div>
  );
};
 
export default Map;