import { AppInjectable } from '@app/framework';
import { AuthGuard } from '@nestjs/passport';

@AppInjectable()
export class RefreshJwtAuthGuard extends AuthGuard("refresh-jwt") {
  
}