import { tryRoutes, API_BASE } from './http';

export function cancelBooking(bookingId: string) {
  const id = encodeURIComponent(bookingId);
  return tryRoutes([
    { method: 'DELETE', path: `/api/bookings/${id}` },
    { method: 'POST',   path: `/api/bookings/${id}/cancel` },
    { method: 'POST',   path: `/api/booking/cancel`, body: { id } }
  ]);
}

export function cancelDriverJourney(postId: string) {
  const id = encodeURIComponent(postId);
  return tryRoutes([
    { method: 'DELETE', path: `/api/driver/journeys/${id}` },
    { method: 'POST',   path: `/api/driver/journeys/${id}/cancel` },
    { method: 'POST',   path: `/api/journeys/${id}/cancel` }
  ]);
}

export function postJourney(payload: any) {
  return tryRoutes([{ method: 'POST', path: `/api/driver/journeys`, body: payload }]);
}

export { API_BASE };
