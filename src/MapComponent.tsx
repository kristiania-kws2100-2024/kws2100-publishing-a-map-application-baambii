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
import Overlay from 'ol/Overlay';

const MapComponent = () => {
  const mapRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const map = new Map({
      target: mapRef.current,
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

    fetch('https://kart.dsb.no/arcgis/rest/services/atom/Sikkerhet_og_beredskap/MapServer/12/query?where=1%3D1&outFields=*&outSR=4326&f=json')
      .then(response => response.json())
      .then(data => {
        const tilfluktsromLayer = new VectorLayer({
          source: new VectorSource({
            features: new GeoJSON().readFeatures(data),
          }),
          style: function (feature) {
            return new Style({
              image: new Circle({
                radius: 3,
                fill: new Fill({ color: 'green' }),
                stroke: new Stroke({ color: 'white', width: 1 }),
              }),
            });
          },
        });

        map.addLayer(tilfluktsromLayer);
      })
      .catch(error => {
        console.error('Error loading tilfluktsrom data:', error);
      });

    const overlay = new Overlay({
      element: overlayRef.current,
      positioning: 'bottom-center',
      offset: [0, -15],
      autoPan: true,
    });

    map.addOverlay(overlay);

    return () => {
      map.dispose();
    };
  }, []);

  return (
    <>
      <div ref={mapRef} style={{ width: '100%', height: '800px' }} />
      <div ref={overlayRef} id="overlay" style={{ display: 'none', backgroundColor: 'white', padding: '10px', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', position: 'absolute' }}>
        Additional Information
      </div>
    </>
  );
};

export default MapComponent;
