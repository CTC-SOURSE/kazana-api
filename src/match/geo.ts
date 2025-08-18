export type Point = { lat: number; lng: number };

const R = 6371; // km
const toRad = (d: number) => (d * Math.PI) / 180;

export const kmBetween = (a: Point, b: Point) => {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat), la2 = toRad(b.lat);
  const h = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
