import EventsView from './EventsView';
import { getNetworkEvents } from '@/lib/sdx-calendars';

/** Rebuild the page from the Luma calendars every ten minutes. */
export const revalidate = 600;

/** Every SDx event: the main calendar plus the UCSD and SDSU chapter calendars. */
export default async function EventsPage() {
  const { events, ok } = await getNetworkEvents();
  return <EventsView events={events} failed={!ok} />;
}
