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
import { pointerMove } from 'ol/events/condition';
import { Select } from 'ol/interaction';
import Overlay from 'ol/Overlay';

const MapComponent = () => {
  const mapRef = useRef(null);
  const overlayRef = useRef(null);

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
    const vectorSourceShelters = new VectorSource({
      format: new GeoJSON(),
      url: '/Offentligetilfluktsrom2.geojson',
      wrapX: false,
    });

    const sheltersLayer = new VectorLayer({
      source: vectorSourceShelters,
      style: new Style({
        image: new Circle({
          radius: 5,
          fill: new Fill({ color: 'green' }), // Change color for emergency shelters
          stroke: new Stroke({ color: 'white', width: 2 }),
        }),
      }),
    });

    map.addLayer(sheltersLayer);

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
