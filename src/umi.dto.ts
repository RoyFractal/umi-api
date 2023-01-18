import { ApiProperty } from '@nestjs/swagger';

export class SendUmiDto {
  @ApiProperty()
  privateKey: Array<number>;
  @ApiProperty()
  publicKey: Array<number>;
  @ApiProperty()
  targetAddress: string;
  @ApiProperty()
  amount: number;
}


export class SignMessageDto {
  @ApiProperty()
  privateKey: Array<number>;
  @ApiProperty()
  message: string;
}


export class RestoreWalletDto {
  @ApiProperty()
  mnemonic: string;
}
