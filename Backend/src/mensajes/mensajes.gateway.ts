import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MensajesService } from './mensajes.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MensajesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly mensajesService: MensajesService) {}

  handleConnection(client: Socket) {
    console.log(`Cliente conectado a WebSocket: ${client.id}`);
    const userId = client.handshake.query.userId;
    if (userId) {
      const roomName = `user_${userId}`;
      client.join(roomName);
      console.log(`Cliente ${client.id} se unió a la sala: ${roomName}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado de WebSocket: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { conversacionId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `conversacion_${data.conversacionId}`;
    client.join(roomName);
    console.log(`Cliente ${client.id} se unió a la sala: ${roomName}`);
    return { event: 'joined', data: roomName };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { emisorId: number; conversacionId: number; detalleMensaje: string },
  ) {
    const { emisorId, conversacionId, detalleMensaje } = data;

    const nuevoMensaje = await this.mensajesService.enviarMensaje(emisorId, {
      conversacionId,
      detalleMensaje,
    });

    const roomName = `conversacion_${conversacionId}`;
    this.server.to(roomName).emit('newMessage', {
      ...nuevoMensaje,
      conversacionId,
    });

    // Emitir a los cuartos de cada usuario para actualizar sus listados de chats
    try {
      const conversacion = await this.mensajesService.obtenerConversacionPorId(conversacionId);
      if (conversacion) {
        const payload = {
          mensaje: nuevoMensaje,
          conversacion: {
            id: conversacion.id,
            estudiante: {
              id: conversacion.estudiante.id,
              username: conversacion.estudiante.username,
              fullName: conversacion.estudiante.fullName,
              imagenPerfil: conversacion.estudiante.imagenPerfil
            },
            tutor: {
              id: conversacion.tutor.id,
              username: conversacion.tutor.username,
              fullName: conversacion.tutor.fullName,
              imagenPerfil: conversacion.tutor.imagenPerfil
            },
            materia: conversacion.materia,
            ultimoMensaje: nuevoMensaje,
            createdAt: conversacion.createdAt
          }
        };

        this.server.to(`user_${conversacion.estudiante.id}`).emit('chat_lista_update', payload);
        this.server.to(`user_${conversacion.tutor.id}`).emit('chat_lista_update', payload);
      }
    } catch (e) {
      console.error('Error al emitir actualización de chat_lista_update:', e);
    }

    console.log(`Mensaje enviado a la sala ${roomName}:`, nuevoMensaje);
  }
}
