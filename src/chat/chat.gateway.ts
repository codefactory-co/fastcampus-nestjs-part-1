import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import {Socket} from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  handleDisconnect(client: Socket) {
    return;
  }

  async handleConnection(client: Socket) {
    try{
      // Bearer 'skjcvoizxcjvlzxicv'
      const rawToken = client.handshake.headers.authorization;

      const payload = await this.authService.parseBearerToken(rawToken, false);

      if(payload){
        client.data.user = payload;
      }else{
        client.disconnect();
      }
    }catch(e){
      console.log(e);
      client.disconnect();
    }
  }

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
