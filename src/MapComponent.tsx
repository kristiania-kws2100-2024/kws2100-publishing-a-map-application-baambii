import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';

interface Props {}

const MapComponent: React.FC<Props> = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

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
        zoom: 5, // Juster zoomnivået etter behov
      }),
    });

    const norwayExtent: [number, number, number, number] = [
      -2000000, 5000000, 4000000, 10000000,
    ];

    const emergencySheltersLayer = new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url: "/kws2100-publishing-a-map-application-baambii/Offentligetilfluktsrom2.geojson",
        wrapX: false,
      }),
      style: function (feature) {
        const plasser: number = feature.get('plasser');
        const status: string = plasser > 0 ? 'Open' : 'Closed';

        return new Style({
          image: new Circle({
            radius: 10,
            fill: new Fill({ color: getStatusColor(status) }),
            stroke: new Stroke({ color: 'white', width: 2 }),
          }),
        });
      },
      extent: norwayExtent,
    });

    map.addLayer(emergencySheltersLayer);

    const overlay = new Overlay({
      element: popupRef.current!,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    map.addOverlay(overlay);

    map.on('click', function (event) {
      const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
        return feature;
      });

      if (feature && feature.get('romnr') && feature.get('plasser') && feature.get('adresse')) {
        const name: string = feature.get('romnr').toString(); // Convert to string if needed
        const status: string = feature.get('plasser') > 0 ? 'Open' : 'Closed';
        const description: string = feature.get('adresse');

        const content = `<div><strong>Shelter Name:</strong> ${name}</div>` +
          `<div><strong>Status:</strong> ${status}</div>` +
          `<div><strong>Description:</strong> ${description}</div>`;

        overlay.setPosition(event.coordinate);
        popupRef.current!.innerHTML = content;
        popupRef.current!.style.display = 'block';
      } else {
        popupRef.current!.style.display = 'none';
      }
    });

    function getStatusColor(status: string): string {
      switch (status) {
        case 'Open':
          return 'green';
        case 'Closed':
          return 'red';
        default:
          return 'grey';
      }
    }

    return () => {
      map.dispose();
    };
  }, []);

  return (
    <div>
      <div ref={mapRef} style={{ width: '100%', height: '800px' }} />
      <div ref={popupRef} className="popup"></div>
    </div>
  );
};

export default MapComponent;
