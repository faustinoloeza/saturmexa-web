import L from "leaflet";

const DefaultIcon = L.Icon.Default.prototype as { _getIconUrl?: string };
DefaultIcon._getIconUrl = undefined as unknown as string;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});
