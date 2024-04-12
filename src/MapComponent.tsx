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
import { pointerMove } from 'ol/events/condition';
import { Select } from 'ol/interaction';
import Overlay from 'ol/Overlay';

interface Props {}

const MapComponent: React.FC<Props> = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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

    // Load emergency shelters data
    fetch('https://kart.dsb.no/share/f1f51e6fb940')
      .then(response => response.json())
      .then(data => {
        const emergencySheltersLayer = new VectorLayer({
          source: new VectorSource({
            features: new GeoJSON().readFeatures(data),
          }),
          style: function (feature) {
            const status: string = feature.get('status');
            let fillColor: string;
            if (status === 'Open') {
              fillColor = 'green';
            } else if (status === 'Closed') {
              fillColor = 'red';
            } else {
              fillColor = 'grey';
            }
            return new Style({
              image: new Circle({
                radius: 7,
                fill: new Fill({ color: fillColor }),
                stroke: new Stroke({ color: 'white', width: 2 }),
              }),
            });
          },
        });

        map.addLayer(emergencySheltersLayer);
      });

    
    const selectHover = new Select({
      condition: pointerMove,
    });

    map.addInteraction(selectHover);

    selectHover.on('select', (event) => {
      const feature = event.selected[0];
      if (feature) {
      
        console.log('Hovered feature:', feature.getProperties());
      }
    });

    
    const overlay = new Overlay({
      element: overlayRef.current!,
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
