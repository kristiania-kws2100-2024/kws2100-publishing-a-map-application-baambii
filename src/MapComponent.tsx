import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';

interface Props {}

const MapComponent: React.FC<Props> = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const map = new Map({
      target: mapRef.current!,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}',
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([10.74609, 59.91273]),
        zoom: 5,
      }),
    });

    // Load civil defence regions data
    fetch('https://kart.dsb.no/arcgis/rest/services/atom/Sikkerhet_og_beredskap/MapServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json')
      .then(response => response.json())
      .then(data => {
        const civilDefenceLayer = new VectorLayer({
          source: new VectorSource({
            features: new GeoJSON().readFeatures(data),
          }),
          style: new Style({
            stroke: new Stroke({
              color: 'blue',
              width: 2,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.1)',
            }),
          }),
        });
        map.addLayer(civilDefenceLayer);
      })
      .catch(error => {
        console.error('Error loading civil defence regions data:', error);
      });

    // Load public shelters data
    fetch('https://raw.githubusercontent.com/kristiania-kws2100-2024/kws2100-publishing-a-map-application-baambii/main/src/Offentligetilfluktsrom2.geojson')
      .then(response => response.json())
      .then(data => {
        const publicSheltersLayer = new VectorLayer({
          source: new VectorSource({
            features: new GeoJSON().readFeatures(data),
          }),
          style: new Style({
            image: new Circle({
              radius: 5,
              fill: new Fill({
                color: 'green',
              }),
              stroke: new Stroke({
                color: 'white',
                width: 2,
              }),
            }),
          }),
        });
        map.addLayer(publicSheltersLayer);
      })
      .catch(error => {
        console.error('Error loading public shelters data:', error);
      });

    return () => {
      map.dispose();
    };
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '800px' }} />;
};

export default MapComponent;
