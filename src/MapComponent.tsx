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
        const places: number = feature.get('plasser');
        let fillColor: string;
        if (places > 500) {
          fillColor = 'green';
        } else if (places > 200) {
          fillColor = 'yellow';
        } else {
          fillColor = 'red';
        }
        return new Style({
          image: new Circle({
            radius: places / 100, /
            fill: new Fill({ color: fillColor }),
            stroke: new Stroke({ color: 'white', width: 2 }),
          }),
        });
      },
      extent: norwayExtent,
    });

    map.addLayer(emergencySheltersLayer);

    map.on('click', function (event) {
      const coordinate = event.coordinate;
      console.log('Clicked coordinate:', coordinate);
    });

    return () => {
      map.dispose();
    };
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '800px' }} />;
};

export default MapComponent;
