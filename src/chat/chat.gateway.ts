import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import {Socket} from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('receiveMessage')
  async receiveMessage(
    @MessageBody() data: {message: string},
    @ConnectedSocket() client: Socket,
  ){
    console.log('receiveMessage');
    console.log(data);
    console.log(client);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() data: {message: string},
    @ConnectedSocket() client: Socket,
  ){
    client.emit('sendMessage', {
      ...data,
      from: 'server',
    });
    client.emit('sendMessage', {
      ...data,
      from: 'server',
    });
    client.emit('sendMessage', {
      ...data,
      from: 'server',
    });
  }
}
