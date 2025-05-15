// @summary CRUD service for calendar events (Schedule domain)
import httpInstance from '../../shared/services/http.instance.js';

export class EventCalendarService {
    endpoint = '/eventos';

    async getAll()        { return (await httpInstance.get(this.endpoint)).data; }
    async getConfirmed()  { return (await httpInstance.get(`${this.endpoint}?status=confirmed`)).data; }
    /* create / update / delete …  */
}
export default new EventCalendarService();
