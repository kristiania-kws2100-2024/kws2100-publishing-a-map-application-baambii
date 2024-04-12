import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';
import { pointerMove } from 'ol/events/condition';
import { Select } from 'ol/interaction';

const MapComponent = () => {
  const mapRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const map = new Map({
      target: mapRef.current!,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://gatekeeper1.geonorge.no/BaatGatekeeper/gk/gk.cache_wmts?version=1.0.0&request=GetTile&layer=topo4&format=image/png&tilematrixset=EPSG:25833&tilematrix={z}&tilerow={y}&tilecol={x}',
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([10.74609, 59.91273]),
        zoom: 5,
      }),
    });

    // Load emergency shelters data from GeoJSON file
    fetch('/Offentligetilfluktsrom2.geojson')
      .then(response => response.json())
      .then(data => {
        const sheltersLayer = new VectorLayer({
          source: new VectorSource({
            features: new GeoJSON().readFeatures(data),
          }),
          style: new Style({
            image: new Circle({
              radius: 5,
              fill: new Fill({ color: 'green' }), // Change color for emergency shelters
              stroke: new Stroke({ color: 'white', width: 2 }),
            }),
          }),
        });

        map.addLayer(sheltersLayer);
      })
      .catch(error => {
        console.error('Error loading emergency shelters data:', error);
      });

    // Add interaction for hovering over features
    const selectHover = new Select({
      condition: pointerMove,
    });

    map.addInteraction(selectHover);

    // Show additional information on hover
    selectHover.on('select', (event) => {
      const feature = event.selected[0];
      if (feature) {
        const properties = feature.getProperties();
        console.log('Hovered feature:', properties);
        // Display additional information in the overlay
        const overlay = overlayRef.current;
        overlay.innerHTML = `
          <h3>${properties.name}</h3>
          <p>Type: ${properties.type}</p>
          <p>Address: ${properties.address}</p>
          <p>Capacity: ${properties.capacity}</p>
        `;
        overlay.style.display = 'block';
      } else {
        // Hide the overlay when not hovering over a feature
        overlayRef.current.style.display = 'none';
      }
    });

    // Create overlay for additional information
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
