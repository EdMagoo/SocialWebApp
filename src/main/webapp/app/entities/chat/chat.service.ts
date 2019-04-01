import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DATE_FORMAT } from 'app/shared/constants/input.constants';
import { map } from 'rxjs/operators';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IChat } from 'app/shared/model/chat.model';
import { IMessage } from 'app/shared/socket.service';

type EntityResponseType = HttpResponse<IChat>;
type EntityArrayResponseType = HttpResponse<IChat[]>;

@Injectable({ providedIn: 'root' })
export class ChatService {
    public resourceUrl = SERVER_API_URL + 'api/chats';

    constructor(private http: HttpClient) {}

    create(chat: IChat): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(chat);
        return this.http
            .post<IChat>(this.resourceUrl, copy, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    update(chat: IChat): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(chat);
        return this.http
            .put<IChat>(this.resourceUrl, copy, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http
            .get<IChat>(`${this.resourceUrl}/${id}`, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    findAllMensajesGuardados(usuarioId1: number, usuarioId2: number): Observable<HttpResponse<IMessage[]>> {
        const httpParams = new HttpParams().set('usuarioId1', usuarioId1.toString()).set('usuarioId2', usuarioId2.toString());
        return this.http.get<IMessage[]>(`${this.resourceUrl}/mensajesGuardados`, { params: httpParams, observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<IChat[]>(this.resourceUrl, { params: options, observe: 'response' })
            .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    protected convertDateFromClient(chat: IChat): IChat {
        const copy: IChat = Object.assign({}, chat, {
            fechaCreacion: chat.fechaCreacion != null && chat.fechaCreacion.isValid() ? chat.fechaCreacion.format(DATE_FORMAT) : null,
            ultimaVezVisto: chat.ultimaVezVisto != null && chat.ultimaVezVisto.isValid() ? chat.ultimaVezVisto.format(DATE_FORMAT) : null
        });
        return copy;
    }

    protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
        if (res.body) {
            res.body.fechaCreacion = res.body.fechaCreacion != null ? moment(res.body.fechaCreacion) : null;
            res.body.ultimaVezVisto = res.body.ultimaVezVisto != null ? moment(res.body.ultimaVezVisto) : null;
        }
        return res;
    }

    protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
        if (res.body) {
            res.body.forEach((chat: IChat) => {
                chat.fechaCreacion = chat.fechaCreacion != null ? moment(chat.fechaCreacion) : null;
                chat.ultimaVezVisto = chat.ultimaVezVisto != null ? moment(chat.ultimaVezVisto) : null;
            });
        }
        return res;
    }
}
