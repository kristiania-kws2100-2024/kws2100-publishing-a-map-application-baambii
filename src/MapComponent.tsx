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

    const civilDefenceLayer = new VectorLayer({
      source: new VectorSource({
        url: 'https://kart.dsb.no/arcgis/rest/services/atom/Sikkerhet_og_beredskap/MapServer/10/query?where=1%3D1&outFields=*&outSR=4326&f=json',
        format: new GeoJSON(),
      }),
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.2)',
        }),
        stroke: new Stroke({
          color: 'red',
          width: 2,
        }),
      }),
      extent: norwayExtent,
    });

    const emergencySheltersLayer = new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url: "/kws2100-publishing-a-map-application-baambii/Offentligetilfluktsrom2.geojson",
        wrapX: false,
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
            radius: 10,
            fill: new Fill({ color: getStatusColor(status) }),
            stroke: new Stroke({ color: 'white', width: 2 }),
          }),
        });
      },
      extent: norwayExtent,
    });

    map.addLayer(civilDefenceLayer);
    map.addLayer(emergencySheltersLayer);

    map.on('click', function (event) {
      const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
        return feature;
      });

      if (feature) {
        const status: string = feature.get('status');
        const name: string = feature.get('name');
        const description: string = feature.get('description');

       
        displayShelterInfo(name, status, description);

       
        feature.setStyle(new Style({
          image: new Circle({
            radius: 10,
            fill: new Fill({ color: getStatusColor(status) }),
            stroke: new Stroke({ color: 'white', width: 2 }),
          }),
        }));
      }
    });

    function displayShelterInfo(name: string, status: string, description: string) {
   
      console.log('Shelter Name:', name);
      console.log('Status:', status);
      console.log('Description:', description);
    }

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

  return <div ref={mapRef} style={{ width: '100%', height: '800px' }} />;
};

export default MapComponent;
