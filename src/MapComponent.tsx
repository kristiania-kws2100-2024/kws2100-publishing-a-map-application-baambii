import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selectedFeature, setSelectedFeature] = useState<{
    plasser: number;
    adresse: string;
  } | null>(null);

  useEffect(() => {
    const vectorSourceShelters = new VectorSource({
      format: new GeoJSON(),
      url: '/Offentligetilfluktsrom2.geojson',
      wrapX: false,
    });

    const map = new Map({
      target: mapRef.current!,
      layers: [
        new VectorLayer({
          source: vectorSourceShelters,
          style: function (feature) {
            // Style the shelters based on their properties
            const plasser = feature.get('plasser');
            let color = 'green';
            if (plasser < 50) {
              color = 'green';
            } else if (plasser < 100) {
              color = 'yellow';
            } else {
              color = 'red';
            }
            return new Style({
              image: new Circle({
                radius: 5,
                fill: new Fill({
                  color: color,
                }),
                stroke: new Stroke({
                  color: 'white',
                  width: 2,
                }),
              }),
            });
          },
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    // Add event listeners for hovering and clicking on vector features
    map.on('pointermove', function (evt) {
      map.getTargetElement().style.cursor = map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
    });

    map.on('click', function (evt) {
      const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
      });

      if (feature) {
        // Display more information about the shelter
        const properties = feature.getProperties();
        setSelectedFeature({
          plasser: properties.plasser,
          adresse: properties.adresse,
        });
      } else {
        setSelectedFeature(null);
      }
    });

    // Add overlay for displaying more information about the shelter
    const overlay = new Overlay({
      element: overlayRef.current!,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -15],
    });
    map.addOverlay(overlay);

    return () => {
      map.dispose();
    };
  }, []);

  return (
    <div>
      <div ref={mapRef} style={{ width: '100%', height: '800px' }} />
      {selectedFeature && (
        <div ref={overlayRef} className="overlay">
          <h2>Emergency Shelter Information</h2>
          <p>Plasser: {selectedFeature.plasser}</p>
          <p>Adresse: {selectedFeature.adresse}</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
